var graph = require("@microsoft/microsoft-graph-client");
require("isomorphic-fetch");

module.exports = {
  getUserDetails: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);

    const user = await client.api("/me").get();
    return user;
  },

  getEvents: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);

    const events = await client
      .api("/me/events")
      .select("subject,organizer,start,end")
      .orderby("createdDateTime DESC")
      .get();

    return events;
  },

  sendMailAutorization: async function(accessToken) {
    const client = getAuthenticatedClient(accessToken);
    let response;
    const mail = {
      subject: "Microsoft Graph JavaScript Sample",
      toRecipients: [
        {
          emailAddress: {
            address: "diegoceraso@gmail.com"
          }
        }
      ],
      body: {
        content:
          "<h1>MicrosoftGraph JavaScript Sample</h1>Check out https://github.com/microsoftgraph/msgraph-sdk-javascript",
        contentType: "html"
      }
    };

    try {
      response = await client.api("/me/sendMail").post({ message: mail });
      console.log(response);
    } catch (error) {
      throw error;
    }

    return response;
  }
};

function getAuthenticatedClient(accessToken) {
  // Initialize Graph client
  const client = graph.Client.init({
    // Use the provided access token to authenticate
    // requests
    authProvider: done => {
      done(null, accessToken);
    }
  });

  return client;
}
