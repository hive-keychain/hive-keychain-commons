const HIVE_MIN_ACCOUNT_NAME_LENGTH = 3;
const HIVE_MAX_ACCOUNT_NAME_LENGTH = 16;

enum UsernameValidation {
  too_short,
  too_long,
  invalid_segment_length,
  invalid_first_character,
  invalid_last_character,
  invalid_middle_characters,
  valid,
}

const validateUsername = (name: string) => {
  const len = name.length;

  if (len < HIVE_MIN_ACCOUNT_NAME_LENGTH) return UsernameValidation.too_short;

  if (len > HIVE_MAX_ACCOUNT_NAME_LENGTH) return UsernameValidation.too_long;

  let begin = 0;
  while (true) {
    let end = name.indexOf('.', begin);
    if (end === -1) end = len;

    if (end - begin < 3) return UsernameValidation.invalid_segment_length;

    const segment = name.slice(begin, end);

    // Check first character: must be a-z
    if (!/^[a-z]/.test(segment[0]))
      return UsernameValidation.invalid_first_character;

    // Check last character: must be a-z or 0-9
    if (!/[a-z0-9]$/.test(segment[segment.length - 1]))
      return UsernameValidation.invalid_last_character;

    // Check middle characters
    for (let i = 1; i < segment.length - 1; i++) {
      if (!/[a-z0-9-]/.test(segment[i]))
        return UsernameValidation.invalid_middle_characters;
    }

    if (end === len) break;
    begin = end + 1;
  }

  return UsernameValidation.valid;
};

export const AccountsUtils = {
  UsernameValidation,
  validateUsername,
};
