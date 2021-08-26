const instantiateModelFromRequestBody = (model, body) => {
  const data = {};
  model.schema.eachPath((pathName, _) => {
    data[pathName] = body[pathName];
  });
  return new model(data);
}

module.exports = {
	instantiateModelFromRequestBody
};
