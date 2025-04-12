import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import AskReviewOrderItemsEmail from './ask-review-order-items'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

// Initialize Resend only if API key is available
const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  if (!resend) {
    console.warn('Resend API key is missing, email sending is disabled')
    return
  }

  try {
    await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: (order.user as { email: string }).email,
      subject: 'Order Confirmation',
      react: <PurchaseReceiptEmail order={order} />,
    })
  } catch (error) {
    console.error('Failed to send purchase receipt email:', error)
    // We don't rethrow the error to prevent it from breaking the main flow
  }
}

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  if (!resend) {
    console.warn('Resend API key is missing, email sending is disabled')
    return
  }

  try {
    const oneDayFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()

    await resend.emails.send({
      from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
      to: (order.user as { email: string }).email,
      subject: 'Review your order items',
      react: <AskReviewOrderItemsEmail order={order} />,
      scheduledAt: oneDayFromNow,
    })
  } catch (error) {
    console.error('Failed to send review request email:', error)
    // We don't rethrow the error to prevent it from breaking the main flow
  }
}
