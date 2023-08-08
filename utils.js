function generateUniqueId() {
    // Implement your logic to generate a unique identifier here
    // You can use libraries like shortid, uuid, or generate your own unique identifier
  
    // For example, generating a random string of 8 characters
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let uniqueId = '';
    for (let i = 0; i < 8; i++) {
      uniqueId += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return uniqueId;
  }
  
  module.exports = { generateUniqueId };
  