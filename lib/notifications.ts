import webpush from 'web-push'

function getWebPush() {
  if (
    process.env.VAPID_PUBLIC_KEY &&
    process.env.VAPID_PRIVATE_KEY &&
    process.env.VAPID_EMAIL
  ) {
    webpush.setVapidDetails(
      `mailto:${process.env.VAPID_EMAIL}`,
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    )
  }
  return webpush
}

export function getSenderNotificationText(hour: number): string {
  if (hour >= 5 && hour < 10)
    return 'あなたのフレーズが、誰かの朝に届きました 📖'
  if (hour >= 10 && hour < 13)
    return 'あなたの言葉が、誰かのひと息に届きました'
  if (hour >= 13 && hour < 17)
    return '午後のひとときに、あなたのフレーズが届きました'
  if (hour >= 17 && hour < 21)
    return '夕暮れ時に、あなたの言葉が誰かに届きました'
  return '眠れない夜に、あなたのフレーズが届きました 🌙'
}

export function getHitNotificationText(rarity: string): string {
  switch (rarity) {
    case 'super_rare':
      return '誰かが、あなたの言葉に刺さりました ✨'
    case 'rare':
      return '今日3人に届き、刺さりました ✨'
    case 'milestone_30days':
      return '1ヶ月越しに、あなたの言葉が誰かに届きました'
    default:
      return 'あなたのフレーズが届きました'
  }
}

const receiverNotifications = [
  '今日の言葉が、待っています',
  '誰かがあなたのために切り抜きました',
  '今朝届いた言葉があります',
  '静かな言葉が一つ、届いています',
  '知らない誰かから、言葉が届きました',
  '今日も一言、届けられています',
  '朝の余白に、言葉を一つ',
]

export function getReceiverNotificationText(): string {
  return receiverNotifications[Math.floor(Math.random() * receiverNotifications.length)]
}

export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string
): Promise<void> {
  try {
    const subscription = JSON.parse(pushToken)
    await getWebPush().sendNotification(subscription, JSON.stringify({ title, body }))
  } catch (error) {
    console.error('Push notification failed:', error)
  }
}
