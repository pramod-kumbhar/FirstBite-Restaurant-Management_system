export function passwordResetHtml(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#e11d48;padding:40px 30px;text-align:center">
              <h1 style="color:#ffffff;font-size:28px;margin:0">🔐 Reset your password</h1>
              <p style="color:#fda4af;font-size:16px;margin:8px 0 0">Hello ${name}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px">
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                We received a request to reset the password for your CulinaryOS account.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                <tr>
                  <td align="center" style="background:#e11d48;border-radius:12px;padding:14px 32px">
                    <a href="${resetUrl}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;border-top:1px solid #e2e8f0;padding-top:20px">
                If you did not request this change, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function verifyEmailHtml(name: string, verificationUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#2563eb;padding:40px 30px;text-align:center">
              <h1 style="color:#ffffff;font-size:28px;margin:0">✉️ Verify your email</h1>
              <p style="color:#dbeafe;font-size:16px;margin:8px 0 0">Almost there, ${name}!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px">
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                Please confirm your email address to activate your CulinaryOS account.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                <tr>
                  <td align="center" style="background:#2563eb;border-radius:12px;padding:14px 32px">
                    <a href="${verificationUrl}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">
                      Verify Email
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;border-top:1px solid #e2e8f0;padding-top:20px">
                If you did not create this account, you can ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
export function orderReadyHtml({ name, orderId, tableNumber }: { name: string; orderId: number; tableNumber?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#2563eb;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">🍽 Your order is ready</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Order #${orderId} is ready to be served${tableNumber ? ` for table ${tableNumber}` : ''}.</p>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Please collect it from the service counter or your waiter will bring it shortly.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function paymentSuccessHtml({ name, orderId, items, finalAmount }: { name: string; orderId: number; items: { name: string; quantity: number; price: string; notes?: string }[]; finalAmount: string }): string {
  const itemsHtml = items.map((item) => `<li style="color:#475569;font-size:14px;margin-bottom:6px"><strong>${item.quantity}x</strong> ${item.name}</li>`).join('');
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#059669;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">💳 Payment completed</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Thank you, ${name}!</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Your payment for order #${orderId} has been received successfully.</p>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="font-weight:bold;color:#1e293b;margin:0 0 8px">Invoice items</p>
              <ul style="margin:0;padding-left:18px">${itemsHtml}</ul>
            </div>
            <p style="color:#1e293b;font-size:16px;font-weight:bold;margin:0">Total Paid: ₹${finalAmount}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function reservationConfirmationHtml({ name, tableNumber, reservationTime, numberOfGuests, status }: { name: string; tableNumber?: string; reservationTime: string; numberOfGuests: number; status: string }): string {
  const readableStatus = status === 'confirmed' ? 'confirmed' : 'received';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#7c3aed;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">📅 Table reservation ${readableStatus}</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Your table reservation request has been ${readableStatus} successfully.</p>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="margin:4px 0;color:#334155"><strong>Table:</strong> ${tableNumber || 'Requested table'}</p>
              <p style="margin:4px 0;color:#334155"><strong>Time:</strong> ${reservationTime}</p>
              <p style="margin:4px 0;color:#334155"><strong>Guests:</strong> ${numberOfGuests}</p>
              <p style="margin:4px 0;color:#334155"><strong>Status:</strong> ${status.toUpperCase()}</p>
            </div>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">We look forward to welcoming you.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function staffApprovalHtml(name: string, role: string, isApproved: boolean): string {
  const status = isApproved ? 'approved' : 'blocked';
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#e11d48;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">🔐 Staff access update</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Your ${role} account has been ${status} by the manager. Please sign in again to continue.</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function waiterOrderReceivedHtml({ name, orderId, orderType, tableNumber }: { name: string; orderId: number; orderType: string; tableNumber?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#f59e0b;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">🧾 New order received</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Order #${orderId} has been received successfully and is ready for you to review and forward to the kitchen.</p>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Service: ${orderType.toUpperCase()}${tableNumber ? ` • Table ${tableNumber}` : ''}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function staffWelcomeEmailHtml({ name, role, email, password, loginUrl }: { name: string; role: string; email: string; password: string; loginUrl: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#0f766e;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">👋 Welcome to CulinaryOS</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Your ${role.toUpperCase()} account has been created successfully. Use the details below to sign in.</p>
            <div style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:16px">
              <p style="margin:4px 0;color:#334155"><strong>Email:</strong> ${email}</p>
              <p style="margin:4px 0;color:#334155"><strong>Temporary Password:</strong> ${password}</p>
            </div>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">You can sign in here:</p>
            <p style="margin:0"><a href="${loginUrl}" style="color:#0f766e;font-weight:bold;text-decoration:none">Open Staff Login</a></p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function managerOrderNotificationHtml({ name, orderId, orderType, tableNumber, status }: { name: string; orderId: number; orderType: string; tableNumber?: string; status: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#7c3aed;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">📋 Order update for management</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Order #${orderId} has a new status update: <strong>${status.toUpperCase()}</strong>.</p>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Service: ${orderType.toUpperCase()}${tableNumber ? ` • Table ${tableNumber}` : ''}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function cashierOrderNotificationHtml({ name, orderId, orderType, tableNumber, status }: { name: string; orderId: number; orderType: string; tableNumber?: string; status: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#0f766e;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">💳 Order payment update</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Order #${orderId} is now marked as <strong>${status.toUpperCase()}</strong>. Please follow up with the customer and billing workflow if needed.</p>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Service: ${orderType.toUpperCase()}${tableNumber ? ` • Table ${tableNumber}` : ''}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function chefOrderNotificationHtml({ name, orderId, orderType, tableNumber }: { name: string; orderId: number; orderType: string; tableNumber?: string }): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr><td style="background:#dc2626;padding:30px;text-align:center"><h1 style="color:#ffffff;font-size:24px;margin:0">👨‍🍳 Kitchen confirmation needed</h1></td></tr>
          <tr><td style="padding:30px">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Hello ${name},</h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 16px">Order #${orderId} has been forwarded to you for confirmation and preparation.</p>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0">Service: ${orderType.toUpperCase()}${tableNumber ? ` • Table ${tableNumber}` : ''}</p>
          </td></tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
export function welcomeEmailHtml(name: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#e11d48;padding:40px 30px;text-align:center">
              <h1 style="color:#ffffff;font-size:28px;margin:0">🍽 CulinaryOS</h1>
              <p style="color:#fda4af;font-size:16px;margin:8px 0 0">Welcome to the family!</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px">
              <h2 style="color:#1e293b;font-size:22px;margin:0 0 16px">Hello ${name},</h2>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                Thank you for creating an account with <strong>CulinaryOS</strong> — your all-in-one restaurant management platform.
              </p>
              <p style="color:#475569;font-size:15px;line-height:1.6;margin:0 0 20px">
                You can now browse our gourmet menu, book tables, place orders, earn loyalty points, and track everything in real-time.
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:24px 0">
                <tr>
                  <td align="center" style="background:#e11d48;border-radius:12px;padding:14px 32px">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/browse" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none">
                      🍕 Start Ordering
                    </a>
                  </td>
                </tr>
              </table>
              <p style="color:#94a3b8;font-size:13px;margin:20px 0 0;border-top:1px solid #e2e8f0;padding-top:20px">
                Cheers,<br>The CulinaryOS Team
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function orderConfirmationHtml({
  name,
  orderId,
  items,
  totalAmount,
  finalAmount,
  gstAmount,
  discountAmount,
  orderType,
  tableNumber,
  estimatedTime,
}: {
  name: string;
  orderId: number;
  items: { name: string; quantity: number; price: string; notes?: string }[];
  totalAmount: string;
  finalAmount: string;
  gstAmount: string;
  discountAmount: string;
  orderType: string;
  tableNumber?: string;
  estimatedTime: number;
}): string {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px">
        <strong>${item.quantity}x</strong> ${item.name}
        ${item.notes ? `<br><span style="color:#94a3b8;font-size:12px">📝 ${item.notes}</span>` : ''}
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;color:#1e293b;font-size:14px;text-align:right">
        $${(parseFloat(item.price) * item.quantity).toFixed(2)}
      </td>
    </tr>`
    )
    .join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 20px">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08)">
          <tr>
            <td style="background:#059669;padding:30px;text-align:center">
              <h1 style="color:#ffffff;font-size:24px;margin:0">✅ Order Confirmed!</h1>
              <p style="color:#a7f3d0;font-size:14px;margin:8px 0 0">Order #${orderId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:30px">
              <h2 style="color:#1e293b;font-size:18px;margin:0 0 8px">Thank you, ${name}!</h2>
              <p style="color:#475569;font-size:14px;margin:0 0 20px">Your order has been placed and is being prepared.</p>

              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:20px">
                <tr>
                  <td style="color:#64748b;font-size:13px;padding:4px 0">Order Type</td>
                  <td style="color:#1e293b;font-size:13px;font-weight:bold;text-align:right;padding:4px 0">${orderType.toUpperCase()}${tableNumber ? ` — Table ${tableNumber}` : ''}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px;padding:4px 0">Estimated Prep Time</td>
                  <td style="color:#1e293b;font-size:13px;font-weight:bold;text-align:right;padding:4px 0">⏱ ${estimatedTime} minutes</td>
                </tr>
              </table>

              <h3 style="color:#1e293b;font-size:15px;margin:0 0 12px">📋 Order Summary</h3>
              <table width="100%" cellpadding="0" cellspacing="0">
                ${itemsHtml}
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border-top:2px solid #1e293b;padding-top:12px">
                <tr>
                  <td style="color:#64748b;font-size:14px">Subtotal</td>
                  <td style="color:#1e293b;font-size:14px;text-align:right">₹${totalAmount}</td>
                </tr>
                ${parseFloat(gstAmount) > 0 ? `<tr>
                  <td style="color:#64748b;font-size:14px">GST (5%)</td>
                  <td style="color:#1e293b;font-size:14px;text-align:right">₹${gstAmount}</td>
                </tr>` : ''}
                ${parseFloat(discountAmount) > 0 ? `<tr>
                  <td style="color:#059669;font-size:14px">Discount</td>
                  <td style="color:#059669;font-size:14px;text-align:right">-₹${discountAmount}</td>
                </tr>` : ''}
                <tr>
                  <td style="color:#1e293b;font-size:18px;font-weight:bold;padding-top:8px">Total Charged</td>
                  <td style="color:#e11d48;font-size:18px;font-weight:bold;text-align:right;padding-top:8px">₹${finalAmount}</td>
                </tr>
              </table>

              <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:16px;margin:24px 0;text-align:center">
                <p style="color:#991b1b;font-size:13px;margin:0;font-weight:bold">⭐ You earned ${Math.floor(parseFloat(finalAmount) / 10)} Loyalty Points!</p>
              </div>

              <p style="color:#94a3b8;font-size:13px;margin:16px 0 0;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center">
                Track your order in real-time at your CulinaryOS dashboard.<br>
                The CulinaryOS Team 🍽
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
