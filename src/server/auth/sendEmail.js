import SparkPost from 'sparkpost'
// const { SPARKPOST_API_KEY } = process.env
const client = new SparkPost('62ce582cb13dbb94f978051aae4e6d66709366e7')

export const sendEmail = async ({ email, url, resetId }) => {
  const newUrl = `${url}/change-password/${resetId}`
  const response = await client.transmissions.send({
    options: {
      sandbox: true
    },
    content: {
      from: 'testing@sparkpostbox.com',
      subject: 'Confirm Email',
      html: `
        <html>
          <body>
            <h1>Ripple - Contagious Attitudes!</h1>
            <h3>Follow this link and login to confirm your account</h3>
            <a href="${newUrl}">Confirm Email</a>
            <p>If you have not initiated this request, please ignore this email.</p>
          </body>
        </html>`
    },
    recipients: [{ address: email }]
  })
  console.log(response)
}
