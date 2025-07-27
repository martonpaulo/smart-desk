export function buildAnnouncement(date: Date): string {
  const dateObj = new Date(date);
  const hours = dateObj.getHours();
  const minutes = dateObj.getMinutes();

  const hourNames = [
    'twelve',
    'one',
    'two',
    'three',
    'four',
    'five',
    'six',
    'seven',
    'eight',
    'nine',
    'ten',
    'eleven',
  ];
  const hourWord = hourNames[hours % 12] || hours.toString();

  if (minutes === 0) {
    return `It is ${hourWord} o'clock`;
  }

  if (minutes === 30) {
    return `It is ${hourWord} thirty`;
  }

  const minuteString = minutes.toString().padStart(2, '0');
  return `It is ${hours}:${minuteString}`;
}
