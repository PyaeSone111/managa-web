export function getCardKeyForSection(section, cardLayout) {
  if (section && cardLayout?.[section]) {
    return cardLayout[section];
  }
  return 'card_01';
}

export function isPortraitCard(cardKey) {
  const num = Number(String(cardKey || 'card_01').replace('card_', ''));
  return !Number.isNaN(num) && num <= 10;
}
