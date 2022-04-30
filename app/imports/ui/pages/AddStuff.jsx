import React from 'react';
import { Grid, Segment, Header, Rating } from 'semantic-ui-react';
import { AutoForm, ErrorsField, HiddenField, NumField, SelectField, SubmitField, TextField } from 'uniforms-semantic';
import swal from 'sweetalert';
import { Meteor } from 'meteor/meteor';
import { _ } from 'meteor/underscore';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import SimpleSchema from 'simpl-schema';
import { Stuffs } from '../../api/stuff/Stuff';

// Create a schema to specify the structure of the data to appear in the form.
const formSchema = new SimpleSchema({
  name: String,
  quantity: Number,
  condition: {
    type: String,
    allowedValues: ['excellent', 'good', 'fair', 'poor'],
    defaultValue: 'good',
  },
  // B: adds rating field
  rating: Number,
});

const bridge = new SimpleSchema2Bridge(formSchema);

/** Renders the Page for adding a document. */
class AddStuff extends React.Component {
  // B: adds constructor to initialize the rating in the state
  constructor(props) {
    super(props);
    this.state = { rating: 0 };
  }

  // On submit, insert the data.
  submit(data, formRef) {
    // B: inserts rating into the destructured data
    const { name, quantity, condition, rating } = data;
    const owner = Meteor.user().username;
    // B: inserts rating into the values passed to insert
    Stuffs.collection.insert({ name, quantity, condition, rating, owner },
      (error) => {
        if (error) {
          swal('Error', error.message, 'error');
        } else {
          swal('Success', 'Item added successfully', 'success');
          formRef.reset();
        }
      });
  }

  // B: updates the rating in the state when the rating field changes
  ratingChanged = (e, { rating }) => {
    this.setState({ rating });
  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  render() {
    let fRef = null;
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Add Stuff</Header>
          {
            // B: the modified part is onSubmit={data => this.submit(_.extend(data, { rating: this.state.rating }).
            // Because Rating is not a Uniforms field, it will not be included in the data by default;
            // _.extend (https://underscorejs.org/#extend) has the effect of combining two objects
            // and here ensures that the data passed to this.submit includes the value of the rating field.
            // this.state.rating is updated in ratingChanged above.
            // This idea was adapted (very loosely) from https://github.com/hangryfix/hangryfix/blob/master/app/imports/ui/pages/EditReview.jsx#L183-L186.
          }
          <AutoForm ref={ref => { fRef = ref; }} schema={bridge} onSubmit={data => this.submit(_.extend(data, { rating: this.state.rating }), fRef)} >
            <Segment>
              <TextField name='name'/>
              <NumField name='quantity' decimal={false}/>
              <SelectField name='condition'/>
              {/* B: className from Uniforms (inspect other fields in the browser to verify) */}
              <div className='required field'>
                {/* B: the label for the rating field */}
                <label htmlFor='rating'>Rating</label>
                {/* B: the Semantic UI Rating component; documentation at https://react.semantic-ui.com/modules/rating/ */}
                <Rating name='displayedRating' maxRating={5} icon='star' onRate={this.ratingChanged} />
                {/* B: the "actual" rating field for schema purposes */}
                <HiddenField id='rating' name='rating' value={this.state.rating} />
              </div>
              <SubmitField value='Submit'/>
              <ErrorsField/>
            </Segment>
          </AutoForm>
        </Grid.Column>
      </Grid>
    );
  }
}

export default AddStuff;
