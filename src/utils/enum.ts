export function isValueInEnum(value: any, Enum: any) {
  return Object.values(Enum).includes(value);
}