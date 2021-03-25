global.BDBC = new BDBConnection();

// keypair generator
BDBC.onKeypairRequest = function(userId, collectionName, doc) {
	// Return keypair which will be used to sign BDB transaction.
	// Most likely you will keep user's keypair in Meteor.users collection
	// and here you can retrieve it based on userId argument.
	// But, for purpose of this demo, let's generate dummy keypair
	// based on fixed password
	return BDBC.keypairFromPassword(userId || "password");
};


Meteor.startup(function() {
	
/*REGISTER_COLLECTIONS*/

	if(Meteor.settings.bigchaindb) {
		BDBC.connect({
			url: Meteor.settings.bigchaindb.url,
			eventsUrl: Meteor.settings.bigchaindb.eventsUrl,
			namespace: Meteor.settings.bigchaindb.namespace,
			appId: Meteor.settings.bigchaindb.appId,
			appKey: Meteor.settings.bigchaindb.appKey
		});
	}
	
});
