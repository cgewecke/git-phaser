//publications.js
Meteor.publish('users', function () {
  return Meteor.users.find();
});

Meteor.publish('connections', function () {
  if (!this.userId){
  	console.log('userId rejected in connections');
  	return;
  }
  console.log("ThisId: " + this.userId);
  return Connections.find();
});