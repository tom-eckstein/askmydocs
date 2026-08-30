export const formatEnumName = (message: string): string => {
  const splitMessage = message.split('_');
  const formatMessage = splitMessage.map(
    (el) => el[0].toUpperCase() + el.substring(1, el.length).toLowerCase(),
  );
  return formatMessage.join(' ');
};
