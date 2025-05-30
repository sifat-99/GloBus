// mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'enayetflweb@gmail.com',
    pass: process.env.NEXT_NODEMAILER_APP_PASSWORD,
  },
});

const sendMail = (to, subject, text) => {
  const mailOptions = {
    from: 'enayetflweb@gmail.com',
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
};

module.exports = { sendMail };



// export const POST = async (request) =>{
//   try {
//     const bookingData = await request.json();
  
//     console.log('data from frontend',bookingData)
//     await connect();
  
//     const newBookingData = new Event(bookingData)


//   console.log('newBookingData', newBookingData)
//    try {
//       await newBookingData.save()

//       // Send email to the original user who created the event
//       const userEmail = bookingData.userEmail; // Change this based on your data structure
//       const subject = 'Booking Information Received';
//       const text = 'Thank you for receiving booking information.';

//       // Call the sendMail function
//       sendMail(userEmail, subject, text);

//       return new NextResponse("Booking successfully made.", {status: 200})
//     } catch (error) {
//       console.log(error)
//       return new NextResponse(error, {status: 500})
//     }
//   } catch (error) {
//     console.log('Internal server error', error)
//     return new NextResponse("Internal Server Error", {status: 500})
//   }
//   }
