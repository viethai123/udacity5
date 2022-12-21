// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '6fetnpzj9i'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-h0mkb766.us.auth0.com',
  clientId: 'DyR1AkoZzg2SpGZTXayZaA0SSubBlcie',
  callbackUrl: 'http://localhost:3000/callback'
}
