// eslint-disable-next-line import/prefer-default-export
export const isJson = str => {
  try {
    JSON.parse(str);
    return true;
  } catch (err) {
    return false;
  }
};

const requiredProps = ['source', 'id', 'timestamp', 'type'];
export const isMicroHomeEvent = object =>
  // Check if object has all required Properties
  requiredProps.map(required => object[required]).filter(Boolean).length ===
  requiredProps.length;
