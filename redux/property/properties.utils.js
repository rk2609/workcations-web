import Properties from "./properties";

const SelectDestinations = (list) =>
  list
    .map((property) => property.location.city.toLowerCase())
    .filter((value, index, self) => {
      return self.indexOf(value) === index;
    });

const capitalise = (s) => s.charAt(0).toUpperCase() + s.slice(1);

export const GetDestinationOptions = (list) =>
  list && list.length
    ? SelectDestinations(list).map((destination) => {
        return { label: capitalise(destination), value: destination };
      })
    : [];

export const GetStateOptions = (list) =>
  list && list.length
    ? list
        .map((property) => property.location.state.toLowerCase())
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
    : [];

export const GetTypeOptions = (list) =>
  list && list.length
    ? list
        .map((property) => property.type.toLowerCase())
        .filter((value, index, self) => {
          return self.indexOf(value) === index;
        })
    : [];

export const GetMinPrice = (list) =>
  list && list.length
    ? Math.min(...list.map((property) => Number(property.long)))
    : 0;

export const GetMaxPrice = (list) =>
  list && list.length
    ? Math.max(...list.map((property) => Number(property.long)))
    : 10000;

export const GetPropertyList = () =>
  Properties.map((property) => {
    const {
      title,
      titleShort,
      slug,
      type,
      amenities,
      inventory,
      images,
      location,
    } = property;

    const { city, state } = location;

    const finalImages = images
      .slice(0, 4)
      .map(
        (image) =>
          "https://www.wanderon.in/workcations/" + slug + "/" + image + ".jpg"
      );

    const ultraShortPrice = inventory
      .map((item) => item.ultraShort)
      .map((item2) => Math.min(...item2.map((item) => item.cost)));

    const shortPrice = inventory
      .map((item) => item.short)
      .map((item2) => Math.min(...item2.map((item) => item.cost)));
    const longPrice = inventory
      .map((item) => item.long)
      .map((item2) => Math.min(...item2.map((item) => item.cost)));

    const ultraShort = Math.min(...ultraShortPrice);
    const short = Math.min(...shortPrice);
    const long = Math.min(...longPrice);

    return {
      title,
      titleShort,
      slug,
      type,
      amenities,
      ultraShort,
      short,
      long,
      images: finalImages,
      city,
      state,
    };
  });

export const FilterProperties = (
  propertyList,
  states,
  stateListAll,
  types,
  typeListAll,
  min,
  max
) => {
  let stateList = [];
  if (states.length > 0) {
    stateList = states.map((state) => state.toLowerCase());
  } else {
    stateList = stateListAll.map((state) => state.toLowerCase());
  }
  let typeList = [];
  if (types.length > 0) {
    typeList = types.map((type) => type.toLowerCase());
  } else {
    typeList = typeListAll.map((type) => type.toLowerCase());
  }

  const list = [];
  const finalList = [];
  const priceList = [];

  propertyList.forEach((property) => {
    if (stateList.indexOf(property.location.state.toLowerCase()) !== -1) {
      list.push(property);
    }
  });

  list.forEach((property) => {
    if (typeList.indexOf(property.type.toLowerCase()) !== -1) {
      finalList.push(property);
    }
  });

  finalList.forEach((property) => {
    if (Number(property.long) >= min && Number(property.long) <= max) {
      priceList.push(property);
    }
  });

  return priceList;
};

export const GetPropertyData = (slug) => {
  return Properties.filter((property) => property.slug === slug);
};

const getProperties = async (url, requestOptions) =>
  await fetch(url, requestOptions)
    .then((res) => res.text())
    .then((res) => JSON.parse(res).feed.entry)
    .then((obj) => {
      return obj.map((item) => {
        return {
          slug: item.gsx$slug.$t,
          title: item.gsx$title.$t,
          titleShort: item.gsx$titleshort.$t,
          type: item.gsx$type.$t,
          location: { city: item.gsx$city.$t, state: item.gsx$state.$t },
          images: [
            item.gsx$imagefirst.$t,
            item.gsx$imagesecond.$t,
            item.gsx$imagethird.$t,
            item.gsx$imagefourth.$t,
          ],
          features: [
            item.gsx$featurefirst.$t,
            item.gsx$featuresecond.$t,
            item.gsx$featurethird.$t,
            item.gsx$featurefourth.$t,
          ],
          ultrashort: item.gsx$ultrashort.$t,
          short: item.gsx$short.$t,
          normal: item.gsx$normal.$t,
          long: item.gsx$long.$t,
          ultralong: item.gsx$ultralong.$t,
          visibility: item.gsx$visibility.$t,
        };
      });
    });

const getProperty = async (url, requestOptions) =>
  await fetch(url, requestOptions)
    .then((res) => res.text())
    .then((result) => JSON.parse(result).feed.entry)
    .then((obj) => {
      return [
        {
          slug: obj[0].gsx$slug.$t,
          title: obj[0].gsx$title.$t,
          titleShort: obj[0].gsx$titleshort.$t,
          type: obj[0].gsx$type.$t,
          location: { city: obj[0].gsx$city.$t, state: obj[0].gsx$state.$t },
          minDuration: Number(obj[0].gsx$minduration.$t),
          about: obj[0].gsx$about.$t,
          breakfast: Number(obj[0].gsx$breakfast.$t),
          lunch: Number(obj[0].gsx$lunch.$t),
          dinner: Number(obj[0].gsx$dinner.$t),
          features: obj
            .filter((item) => item.gsx$features.$t !== "")
            .map((item) => item.gsx$features.$t),
          inventory: [
            ...new Set(
              obj
                .filter((item) => item.gsx$roomtype.$t !== "")
                .map((item) => item.gsx$roomtype.$t)
            ),
          ].map((roomType) => {
            const index = obj
              .map((item) => item.gsx$roomtype.$t)
              .indexOf(roomType);
            return {
              type: roomType,
              image: obj[index].gsx$image.$t,
              max: Number(obj[index].gsx$max.$t),
              unit: obj[index].gsx$unit.$t,
              ultrashort: obj
                .filter((item) => item.gsx$roomtype.$t === roomType)
                .map((item) => {
                  return {
                    sharing: item.gsx$sharing.$t,
                    cost: Number(item.gsx$ultrashort.$t),
                  };
                }),
              short: obj
                .filter((item) => item.gsx$roomtype.$t === roomType)
                .map((item) => {
                  return {
                    sharing: item.gsx$sharing.$t,
                    cost: Number(item.gsx$short.$t),
                  };
                }),
              normal: obj
                .filter((item) => item.gsx$roomtype.$t === roomType)
                .map((item) => {
                  return {
                    sharing: item.gsx$sharing.$t,
                    cost: Number(item.gsx$normal.$t),
                  };
                }),
              long: obj
                .filter((item) => item.gsx$roomtype.$t === roomType)
                .map((item) => {
                  return {
                    sharing: item.gsx$sharing.$t,
                    cost: Number(item.gsx$long.$t),
                  };
                }),
              ultralong: obj
                .filter((item) => item.gsx$roomtype.$t === roomType)
                .map((item) => {
                  return {
                    sharing: item.gsx$sharing.$t,
                    cost: Number(item.gsx$ultralong.$t),
                  };
                }),
            };
          }),

          images: obj
            .filter((item) => item.gsx$images.$t !== "")
            .map((item) => item.gsx$images.$t),
          inclusions: obj
            .filter((item) => item.gsx$inclusions.$t !== "")
            .map((item) => item.gsx$inclusions.$t),
          exclusions: obj
            .filter((item) => item.gsx$exclusions.$t !== "")
            .map((item) => item.gsx$exclusions.$t),
          nearby: obj
            .filter((item) => item.gsx$nearbytitle.$t !== "")
            .map((item) => {
              return {
                image: item.gsx$nearbyimage.$t,
                title: item.gsx$nearbytitle.$t,
                distance: item.gsx$nearbydistance.$t,
              };
            }),
          essentials: obj
            .filter((item) => item.gsx$essentialstitle.$t !== "")
            .map((item) => {
              return {
                title: item.gsx$essentialstitle.$t,
                distance: item.gsx$essentialsdistance.$t,
              };
            }),
        },
      ];
    });

export const getPropertiesListExcel = async () => {
  const url =
    "https://spreadsheets.google.com/feeds/list/14sxSAFqgV2o3xTlK2nghOxXhecij8FGQlZpECee45gM/1/public/values?alt=json";

  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  return await getProperties(url, requestOptions);
};

export const getPropertyExcel = async (slug) => {
  let sheetNo = 5;

  await getProperties(
    "https://spreadsheets.google.com/feeds/list/14sxSAFqgV2o3xTlK2nghOxXhecij8FGQlZpECee45gM/1/public/values?alt=json",
    {
      method: "GET",
      redirect: "follow",
    }
  ).then((res) => {
    sheetNo = res.map((item) => item.slug).indexOf(slug) + 3;
  });

  const url =
    "https://spreadsheets.google.com/feeds/list/14sxSAFqgV2o3xTlK2nghOxXhecij8FGQlZpECee45gM/" +
    sheetNo +
    "/public/values?alt=json";

  const requestOptions = {
    method: "GET",
    redirect: "follow",
  };

  return await getProperty(url, requestOptions);
};
