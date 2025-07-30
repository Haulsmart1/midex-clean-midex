import nodemailer from 'nodemailer'

export default async function handler(req, res) {
  const { name, email, password } = JSON.parse(req.body)

  const transporter = nodemailer.createTransport({
    host: 'smtp.ionos.co.uk',
    port: 587,
    secure: false, // true for 465, false for 587
    auth: {
      user: 'booking@midnight-express.org',
      pass: 'Telephone1409!'
    }
  })

  const body = `
Hi ${name},

Your Admin Account has been created for Midnight Express.

Login Email: ${email}
Temporary Password: ${password}

Login Here: https://midnight-express.org/login

Please log in and change your password after first access.
`

  try {
    await transporter.sendMail({
      from: '"Midnight Express" <booking@midnight-express.org>',
      to: email,
      subject: 'Your Admin Account Access',
      text: body,
    })

    res.status(200).json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('Email send failed:', error)
    res.status(500).json({ success: false, message: 'Failed to send email', error })
  }
}

