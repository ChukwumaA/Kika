const mg = require('mailgun-js');
const { apiKey, domain } = require('../config');

exports.mailgun = () =>
  mg({
    apiKey,
    domain,
  });

exports.payOrderEmailTemplate = (delivery) => {
  return `<h1>Thanks for shopping with us</h1>
  <p>
  Hi ${delivery.user.name},</p>
  <p>We have finished processing your order.</p>
  <h2>[Order ${delivery._id}] (${delivery.createdAt.toString().substring(0, 10)})</h2>
  <table>
  <thead>
  <tr>
  <td><strong>Product</strong></td>
  <td><strong>Quantity</strong></td>
  <td><strong align="right">Price</strong></td>
  </thead>
  <tbody>
  ${delivery.orderItems
    .map(
      (item) => `
    <tr>
    <td>${item.name}</td>
    <td align="center">${item.quantity}</td>
    <td align="right"> $${item.price.toFixed(2)}</td>
    </tr>
  `
    )
    .join('\n')}
  </tbody>
  <tfoot>
  <tr>
  <td colspan="2">Items Price:</td>
  <td align="right"> $${delivery.itemsPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2">Delivery Price:</td>
  <td align="right"> $${delivery.deliveryPrice.toFixed(2)}</td>
  </tr>
  <tr>
  <td colspan="2"><strong>Total Price:</strong></td>
  <td align="right"><strong> $${delivery.totalPrice.toFixed(2)}</strong></td>
  </tr>
  <tr>
  <td colspan="2">Payment Method:</td>
  <td align="right">${delivery.paymentMethod}</td>
  </tr>
  </table> 

  <h2>Delivery address</h2>
  <p>
  ${delivery.deliveryAddress.fullName},<br/>
  ${delivery.deliveryAddress.address},<br/>
  ${delivery.deliveryAddress.noticableLandmarks},<br/>
  ${delivery.deliveryAddress.state},<br/>
  ${delivery.deliveryAddress.country}<br/>
  </p>
  <hr/>
  <p>
  Thanks for shopping with us.
  </p>
  `;
};
