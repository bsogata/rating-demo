import React from 'react';
import { Grid, Loader, Header, Segment, Rating } from 'semantic-ui-react';
import swal from 'sweetalert';
import { AutoForm, ErrorsField, HiddenField, NumField, SelectField, SubmitField, TextField } from 'uniforms-semantic';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { _ } from 'meteor/underscore';
import PropTypes from 'prop-types';
import SimpleSchema2Bridge from 'uniforms-bridge-simple-schema-2';
import { Stuffs } from '../../api/stuff/Stuff';

const bridge = new SimpleSchema2Bridge(Stuffs.schema);

/** Renders the Page for editing a single document. */
class EditStuff extends React.Component {

  // On successful submit, insert the data.
  submit(data) {
    // B: inserts rating into the destructured data
    const { name, quantity, condition, rating, _id } = data;
    // B: inserts rating into the values passed to insert
    Stuffs.collection.update(_id, { $set: { name, quantity, condition, rating } }, (error) => (error ?
      swal('Error', error.message, 'error') :
      swal('Success', 'Item updated successfully', 'success')));
  }

  // B: updates the rating in the state when the rating field changes
  ratingChanged = (e, { rating }) => {
    this.setState({ rating });
  }

  // If the subscription(s) have been received, render the page, otherwise show a loading icon.
  render() {
    return (this.props.ready) ? this.renderPage() : <Loader active>Getting data</Loader>;
  }

  // Render the form. Use Uniforms: https://github.com/vazco/uniforms
  renderPage() {
    return (
      <Grid container centered>
        <Grid.Column>
          <Header as="h2" textAlign="center">Edit Stuff</Header>
          {
            // B: the modified part is onSubmit={data => this.submit(_.extend(data, { rating: this.state.rating }).
            // Because Rating is not a Uniforms field, it will not be included in the data by default;
            // _.extend (https://underscorejs.org/#extend) has the effect of combining two objects
            // and here ensures that the data passed to this.submit includes the value of the rating field.
            // this.state.rating is updated in ratingChanged above.
            // This idea was adapted (very loosely) from https://github.com/hangryfix/hangryfix/blob/master/app/imports/ui/pages/EditReview.jsx#L183-L186.
          }
          <AutoForm schema={bridge} onSubmit={data => this.submit(_.extend(data, { rating: this.state.rating }))} model={this.props.doc}>
            <Segment>
              <TextField name='name'/>
              <NumField name='quantity' decimal={false}/>
              <SelectField name='condition'/>
              {/* B: className from Uniforms (inspect other fields in the browser to verify) */}
              <div className='required field'>
                {/* B: the label for the rating field */}
                <label htmlFor='rating'>Rating</label>
                {/* B: the Semantic UI Rating component; documentation at https://react.semantic-ui.com/modules/rating/ */}
                <Rating id='rating' name='rating' defaultRating={this.props.doc.rating} maxRating={5} icon='star' onRate={this.ratingChanged} />
              </div>
              <SubmitField value='Submit'/>
              <ErrorsField/>
              <HiddenField name='owner' />
            </Segment>
          </AutoForm>
        </Grid.Column>
      </Grid>
    );
  }
}

// Require the presence of a Stuff document in the props object. Uniforms adds 'model' to the props, which we use.
EditStuff.propTypes = {
  doc: PropTypes.object,
  model: PropTypes.object,
  ready: PropTypes.bool.isRequired,
};

// withTracker connects Meteor data to React components. https://guide.meteor.com/react.html#using-withTracker
export default withTracker(({ match }) => {
  // Get the documentID from the URL field. See imports/ui/layouts/App.jsx for the route containing :_id.
  const documentId = match.params._id;
  // Get access to Stuff documents.
  const subscription = Meteor.subscribe(Stuffs.userPublicationName);
  // Determine if the subscription is ready
  const ready = subscription.ready();
  // Get the document
  const doc = Stuffs.collection.findOne(documentId);
  return {
    doc,
    ready,
  };
})(EditStuff);
