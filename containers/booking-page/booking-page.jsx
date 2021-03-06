import React, { useState, useEffect, Fragment } from "react";
import Head from "next/head";

import FormInput from "../../components/form-input-text/form-input-text";

import {
  PageContainer,
  FlexItem,
  Summary,
  PropertyTitle,
  CheckInCheckOut,
  SummaryItem,
  Image,
  CartSharingTitle,
  Sharing,
  SharingItem,
  CartSharingSharingTitle,
  SharingCount,
  SharingTotal,
  CartTotal,
  Line,
  Grid,
  GridTraveler,
  GridTravelerList,
  GridTravelerTitle,
  Submit,
  DownloadContainer,
  DownloadInvoice,
  RadioGroup,
  RadioGroupLabel,
  RadioGroupButtons,
  RadioButton,
} from "./booking-page.style";

const getNoOfDays = (date1, date2) => {
  return (date2.getTime() - date1.getTime()) / 86400000;
};

const getTotal = (total, num) => {
  return total + num;
};

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const submitUserData = async (data) => {
  var myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  var raw = JSON.stringify(data);

  var requestOptions = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  return await fetch(
    "https://cors-anywhere.herokuapp.com/https://taxilead.herokuapp.com/submitUserData",
    requestOptions
  )
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.log("error", error));
};

const BookingPage = ({ data, bookingSlug }) => {
  const {
    account,
    advance,
    amount,
    cart,
    cartDetails,
    property,
    checkIn,
    checkOut,
    leadSource,
    name,
    phone,
    totalPax,
    salesPerson,
    customer,
    bookingId,
  } = data;

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  const TotalAmount = cart
    .map((cartItem) =>
      cartItem.rooms
        .map((room) =>
          Math.round(getNoOfDays(checkInDate, checkOutDate)) < 21
            ? Math.round(getNoOfDays(checkInDate, checkOutDate)) < 16
              ? Math.round(getNoOfDays(checkInDate, checkOutDate)) < 11
                ? Math.round(getNoOfDays(checkInDate, checkOutDate)) < 6
                  ? room.ultrashort *
                    room.count *
                    Math.round(getNoOfDays(checkInDate, checkOutDate))
                  : room.short *
                    room.count *
                    Math.round(getNoOfDays(checkInDate, checkOutDate))
                : room.normal *
                  room.count *
                  Math.round(getNoOfDays(checkInDate, checkOutDate))
              : room.long *
                room.count *
                Math.round(getNoOfDays(checkInDate, checkOutDate))
            : room.ultralong *
              room.count *
              Math.round(getNoOfDays(checkInDate, checkOutDate))
        )
        .reduce(getTotal, 0)
    )
    .reduce(getTotal, 0);

  const [userSubmitted, setUserSubmitted] = useState(customer);
  const [userGender, setUserGender] = useState("m");
  const [fullName, setFullName] = useState({ value: name, warningMessage: "" });
  const [phoneNo, setPhoneNo] = useState({
    value: phone,
    warningMessage: "",
  });
  const [alternatePhoneNo, setAlternatePhoneNo] = useState({
    value: "",
    warningMessage: "",
  });
  const [address, setAddress] = useState({
    value: "",
    warningMessage: "",
  });
  const [email, setEmail] = useState({
    value: "",
    warningMessage: "",
  });
  const [company, setCompany] = useState({
    value: "",
    warningMessage: "",
  });
  const [post, setPost] = useState({
    value: "",
    warningMessage: "",
  });

  const [travelersNames, setTravelersNames] = useState([]);
  const [travelersPhones, setTravelersPhones] = useState([]);
  const [travelersGenders, setTravelersGenders] = useState([]);

  const handleChange = (event) => {
    const { value, name } = event.target;

    if (name === "fullName") {
      setFullName({ ...fullName, value: value });
    } else if (name === "phoneNo" && value.length !== 11) {
      setPhoneNo({ ...phoneNo, value: value });
    } else if (name === "address") {
      setAddress({ ...address, value: value });
    } else if (name === "email") {
      setEmail({ ...email, value: value });
    } else if (name === "alternatePhoneNo" && value.length !== 11) {
      setAlternatePhoneNo({ ...alternatePhoneNo, value: value });
    } else if (name === "company") {
      setCompany({ ...company, value: value });
    } else if (name === "post") {
      setPost({ ...post, value: value });
    }
  };

  const handleChangeTravelers = (event) => {
    const { value, name } = event.target;

    if (name.split(" ")[0] === "travelerName") {
      const index = Number(name.split(" ")[1]) - 2;
      let namesArray = new Array(totalPax.value - 1).fill("");

      for (let i = 0; i < namesArray.length; i++) {
        namesArray[i] = travelersNames[i];
      }

      namesArray[index] = value;
      setTravelersNames(namesArray);
    } else if (name.split(" ")[0] === "travelerPhone" && value.length !== 11) {
      const index = Number(name.split(" ")[1]) - 2;
      let phonesArray = new Array(totalPax.value - 1).fill("");

      for (let i = 0; i < phonesArray.length; i++) {
        phonesArray[i] = travelersPhones[i];
      }

      phonesArray[index] = value;
      setTravelersPhones(phonesArray);
    }
  };

  const submitDataFinal = (event) => {
    event.preventDefault();

    const data = {
      bookingSlug,
      bookingId,
      account,
      advance,
      amount,
      cart,
      cartDetails,
      property,
      checkIn,
      checkOut,
      leadSource,
      name: fullName.value,
      gender: userGender,
      phone: phoneNo.value,
      salesPerson,
      customer: true,
      alternatePhoneNo: alternatePhoneNo.value,
      address: address.value,
      email: email.value,
      company: company.value,
      post: post.value,
      totalPax,
      travelersNames,
      travelersPhones,
      travelersGenders,
    };

    submitUserData(data).then((res) => {
      setUserSubmitted(true);
    });
  };

  useEffect(() => {
    if (totalPax.value) {
      setTravelersNames(new Array(totalPax.value - 1).fill(""));
      setTravelersPhones(new Array(totalPax.value - 1).fill(""));
      setTravelersGenders(new Array(totalPax.value - 1).fill("m"));
    } else {
      setTravelersNames([]);
      setTravelersPhones([]);
      setTravelersGenders([]);
    }
  }, [totalPax]);

  return (
    <Fragment>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <PageContainer>
        <div>
          {cart ? (
            <FlexItem className="carousel">
              <h2>Booking Summary</h2>
              <Summary>
                <PropertyTitle>{property.title}</PropertyTitle>
                <CheckInCheckOut>
                  <div>
                    Check In
                    <span>
                      {checkInDate.getDate()}{" "}
                      {monthNames[checkInDate.getMonth()]}
                      {","}
                      {checkInDate.getFullYear()}
                    </span>
                  </div>
                  <div>
                    Check Out
                    <span>
                      {checkOutDate.getDate()}{" "}
                      {monthNames[checkOutDate.getMonth()]}
                      {", "}
                      {checkOutDate.getFullYear()}
                    </span>
                  </div>
                </CheckInCheckOut>
                {cart.map((cartItem, i) => (
                  <SummaryItem key={i}>
                    <Image
                      src={
                        "https://www.wanderon.in/workcations/" +
                        property.slug +
                        "/" +
                        cartItem.image +
                        ".jpg"
                      }
                      alt={cartItem.image}
                    />
                    <CartSharingTitle>{cartItem.type}</CartSharingTitle>
                    <Sharing>
                      {cartItem.rooms.map((room, j) => (
                        <SharingItem key={i + "room" + j}>
                          <CartSharingSharingTitle>
                            {room.sharing}
                            <span>
                              INR{" "}
                              {Math.round(
                                getNoOfDays(checkInDate, checkOutDate)
                              ) < 21
                                ? Math.round(
                                    getNoOfDays(checkInDate, checkOutDate)
                                  ) < 16
                                  ? Math.round(
                                      getNoOfDays(checkInDate, checkOutDate)
                                    ) < 11
                                    ? Math.round(
                                        getNoOfDays(checkInDate, checkOutDate)
                                      ) < 6
                                      ? room.ultrashort
                                      : room.short
                                    : room.normal
                                  : room.long
                                : room.ultralong}
                              /- per night
                            </span>
                          </CartSharingSharingTitle>
                          <SharingCount>X {room.count}</SharingCount>
                          <SharingTotal>
                            =&nbsp;&nbsp;&nbsp;
                            {(
                              room.count *
                              (Math.round(
                                getNoOfDays(checkInDate, checkOutDate)
                              ) < 21
                                ? Math.round(
                                    getNoOfDays(checkInDate, checkOutDate)
                                  ) < 16
                                  ? Math.round(
                                      getNoOfDays(checkInDate, checkOutDate)
                                    ) < 11
                                    ? Math.round(
                                        getNoOfDays(checkInDate, checkOutDate)
                                      ) < 6
                                      ? room.ultrashort
                                      : room.short
                                    : room.normal
                                  : room.long
                                : room.ultralong)
                            ).toLocaleString("en-IN", {
                              style: "currency",
                              currency: "INR",
                            })}
                          </SharingTotal>
                        </SharingItem>
                      ))}
                    </Sharing>
                  </SummaryItem>
                ))}
                <CartTotal>
                  <div>
                    <span>Total</span>
                    <span>
                      {TotalAmount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                      })}
                    </span>
                  </div>
                  <div>
                    <span>
                      Discount(
                      {(
                        ((TotalAmount - Number(amount) / 1.05) * 100) /
                        TotalAmount
                      ).toFixed(2)}
                      %)
                    </span>
                    <span>
                      {(TotalAmount - Number(amount) / 1.05).toLocaleString(
                        "en-IN",
                        {
                          maximumFractionDigits: 2,
                          style: "currency",
                          currency: "INR",
                        }
                      )}
                    </span>
                  </div>
                  <div>
                    <span>GST(5%)</span>
                    <span>
                      {(Number(amount) / 21).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                      })}
                    </span>
                  </div>
                  <Line />
                  <div>
                    <span>Grand Total</span>
                    <span>
                      {Number(amount).toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                        style: "currency",
                        currency: "INR",
                      })}
                    </span>
                  </div>
                  <Line />
                </CartTotal>
              </Summary>
            </FlexItem>
          ) : null}
        </div>
        {!userSubmitted ? (
          <form onSubmit={submitDataFinal} style={{ textAlign: "center" }}>
            <FormInput
              name="bookingId"
              type="text"
              value={bookingId}
              required
              label="Booking Id"
              warningMessage=""
              handleChange={handleChange}
            />
            <GridTraveler>
              <RadioGroup>
                <RadioGroupLabel>Gender</RadioGroupLabel>
                <RadioGroupButtons>
                  <RadioButton>
                    <input
                      id="userGenderMale"
                      onChange={(e) => {
                        setUserGender(e.target.value);
                      }}
                      value="m"
                      type="radio"
                      checked={userGender === "m"}
                    />
                    <label htmlFor="userGenderMale">Male</label>
                  </RadioButton>
                  <RadioButton>
                    <input
                      id="userGenderFemale"
                      onChange={(e) => {
                        setUserGender(e.target.value);
                      }}
                      value="f"
                      type="radio"
                      checked={userGender === "f"}
                    />
                    <label htmlFor="userGenderFemale">Female</label>
                  </RadioButton>
                  <RadioButton>
                    <input
                      id="userGenderOther"
                      onChange={(e) => {
                        setUserGender(e.target.value);
                      }}
                      value="o"
                      type="radio"
                      checked={userGender === "o"}
                    />
                    <label htmlFor="userGenderOther">Other</label>
                  </RadioButton>
                </RadioGroupButtons>
              </RadioGroup>
            </GridTraveler>
            <Grid>
              <FormInput
                name="fullName"
                type="text"
                value={fullName.value}
                required
                label="Full Name"
                warningMessage={fullName.warningMessage}
                handleChange={handleChange}
              />
              <FormInput
                name="phoneNo"
                type="number"
                value={phoneNo.value}
                required
                label="Phone No"
                warningMessage={phoneNo.warningMessage}
                handleChange={handleChange}
              />
            </Grid>
            <Grid>
              <FormInput
                name="alternatePhoneNo"
                type="number"
                value={alternatePhoneNo.value}
                label="Alternate Phone No"
                warningMessage={alternatePhoneNo.warningMessage}
                handleChange={handleChange}
              />
              <FormInput
                name="email"
                type="email"
                value={email.value}
                required
                label="Email Id"
                warningMessage={email.warningMessage}
                handleChange={handleChange}
              />
            </Grid>
            <FormInput
              name="address"
              type="text"
              value={address.value}
              required
              label="Full Address"
              warningMessage={address.warningMessage}
              handleChange={handleChange}
            />
            <Grid>
              <FormInput
                name="company"
                type="text"
                value={company.value}
                required
                label="Company"
                warningMessage={company.warningMessage}
                handleChange={handleChange}
              />
              <FormInput
                name="post"
                type="text"
                value={post.value}
                required
                label="Designation"
                warningMessage={post.warningMessage}
                handleChange={handleChange}
              />
              <FormInput
                name="noOfPax"
                type="number"
                value={totalPax.value}
                required
                label="No Of Pax"
                warningMessage=""
                handleChange={handleChange}
              />
            </Grid>
            {travelersNames.map((item, i) => (
              <GridTravelerList key={"extra traveler" + (i + 1)}>
                <GridTravelerTitle>Traveler {i + 2} Details</GridTravelerTitle>
                <RadioGroup>
                  <RadioGroupLabel>Gender</RadioGroupLabel>
                  <RadioGroupButtons>
                    <RadioButton>
                      <input
                        id={"userGenderMale" + (i + 2)}
                        onChange={(e) => {
                          let gendersArray = new Array(totalPax.value - 1).fill(
                            "m"
                          );

                          for (let i = 0; i < gendersArray.length; i++) {
                            gendersArray[i] = travelersGenders[i];
                          }
                          gendersArray[i] = e.target.value;
                          setTravelersGenders(gendersArray);
                        }}
                        value="m"
                        type="radio"
                        checked={travelersGenders[i] === "m"}
                      />
                      <label htmlFor={"userGenderMale" + (i + 2)}>Male</label>
                    </RadioButton>
                    <RadioButton>
                      <input
                        id={"userGenderFemale" + (i + 2)}
                        onChange={(e) => {
                          let gendersArray = new Array(totalPax.value - 1).fill(
                            "m"
                          );

                          for (let i = 0; i < gendersArray.length; i++) {
                            gendersArray[i] = travelersGenders[i];
                          }

                          gendersArray[i] = e.target.value;
                          setTravelersGenders(gendersArray);
                        }}
                        value="f"
                        type="radio"
                        checked={travelersGenders[i] === "f"}
                      />
                      <label htmlFor={"userGenderFemale" + (i + 2)}>
                        Female
                      </label>
                    </RadioButton>
                    <RadioButton>
                      <input
                        id={"userGenderOther" + (i + 2)}
                        onChange={(e) => {
                          let gendersArray = new Array(totalPax.value - 1).fill(
                            "m"
                          );

                          for (let i = 0; i < gendersArray.length; i++) {
                            gendersArray[i] = travelersGenders[i];
                          }

                          gendersArray[i] = e.target.value;
                          setTravelersGenders(gendersArray);
                        }}
                        value="o"
                        type="radio"
                        checked={travelersGenders[i] === "o"}
                      />
                      <label htmlFor={"userGenderOther" + (i + 2)}>Other</label>
                    </RadioButton>
                  </RadioGroupButtons>
                </RadioGroup>
                <Grid>
                  <FormInput
                    name={"travelerName " + (i + 2)}
                    type="text"
                    value={travelersNames[i]}
                    label={"Name"}
                    warningMessage=""
                    handleChange={handleChangeTravelers}
                    required
                  />
                  <FormInput
                    name={"travelerPhone " + (i + 2)}
                    type="number"
                    value={travelersPhones[i]}
                    label={"Phone"}
                    warningMessage=""
                    handleChange={handleChangeTravelers}
                    required
                  />
                </Grid>
              </GridTravelerList>
            ))}
            <Submit type="submit" value="Submit"></Submit>
          </form>
        ) : (
          <DownloadContainer>
            <DownloadInvoice
              href={`https://taxilead.herokuapp.com/pdf/${bookingSlug}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Booking Voucher
            </DownloadInvoice>
          </DownloadContainer>
        )}
      </PageContainer>
    </Fragment>
  );
};

export default BookingPage;
