// this code is working

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import { fetchAuctions } from "../api/auction"; // Assume these are utility functions for API calls
import { getToken } from "../api/token";
import "../css/Auction.css";  // Import the CSS file

const API_URL = process.env.REACT_APP_API_URL;

// Working good

// ------------------ working code as on 10 baje subhah -----------------------//

const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  const decodedRef = useRef(null);

  // useEffect(() => {
  //   // Initialize Pusher
  //   const pusher = new Pusher("0876dcda9524e34aab76", {
  //     cluster: "ap2",
  //   });

  //   // Subscribe to the "auction" channel
  //   const channel = pusher.subscribe("auction-channel");

  //   // Listen for "update" event
  //   channel.bind("update", (data) => {
  //     setAuctions((prevAuctions) =>
  //       prevAuctions.map((auction) =>
  //         auction.id === data.auctionId ? { ...auction, ...data } : auction
  //       )
  //     );
  //   });

  //   // Listen for "auctionEnd" event
  //   channel.bind("auctionEnd", (data) => {
  //     const { auctionId, winner: auctionWinner } = data;
  //     setAuctions((prevAuctions) =>
  //       prevAuctions.map((auction) => {
  //         if (auction.id === auctionId) {
  //           return {
  //             ...auction,
  //             isPlaceBidActive: false,
  //             buyNowActive: decodedRef.current?.email === auctionWinner,
  //             isWinner:
  //               decodedRef.current?.email === auctionWinner
  //                 ? auctionWinner
  //                 : false,
  //             winner: auctionWinner,
  //           };
  //         }
  //         return auction;
  //       })
  //     );
  //   });

  //   return () => {
  //     channel.unbind_all();
  //     channel.unsubscribe();
  //   };
  // }, []);

  // // Fetch auctions on component mount
  // useEffect(() => {
  //   const fetchAuctionData = async () => {
  //     try {
  //       const token = getToken();
  //       if (!token) {
  //         alert("You need to login to view the auction.");
  //         return;
  //       }

  //       const decoded = JSON.parse(atob(token.split(".")[1]));
  //       decodedRef.current = decoded;

  //       const auctionData = await fetchAuctions();
  //       const processedAuctionData = auctionData.map((auction) => ({
  //         // id: auction._id,
  //         // product: auction.product,
  //         // currentBid: auction.currentBid,
  //         // highestBidder: auction.highestBidder,
  //         // timer: auction.timer,
  //         // isActive: auction.isActive,
  //         // buyNowActive: auction.isBuyNowLive,
  //         // isPlaceBidActive: auction.isActive,
  //         // buyNowTimer: auction.buyNowTimerLeft
  //         //   ? new Date(new Date(auction.buyNowTimerLeft))
  //         //   : null,

  //         id: auction._id, // Use _id as id
  //         product: auction.product,
  //         currentBid: auction.currentBid,
  //         highestBidder: auction.highestBidder,
  //         timer: auction.timer,
  //         isActive: auction.isActive,
  //         buyNowActive: auction.isBuyNowLive ? true : false,
  //         isPlaceBidActive: auction.isActive === true ? true : false,
  //         // buyNowTimer: auction.buyNowTimerLeft
  //         //   ? new Date(new Date(auction.buyNowTimerLeft).getTime() + 5.5 * 60 * 60 * 1000)
  //         //   : null,
  //         buyNowTimer: auction.buyNowTimerLeft
  //           ? new Date(new Date(auction.buyNowTimerLeft))
  //           : null,
  //       }));

  //       setAuctions(processedAuctionData);
  //     } catch (error) {
  //       console.error("Error fetching auction data:", error);
  //       alert("Failed to fetch auction data.");
  //     }
  //   };

  //   fetchAuctionData();
  // }, []);

  useEffect(() => {
    // Initialize Pusher
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    // Subscribe to the "auction" channel
    const channel = pusher.subscribe("auction-channel");

    // Fetch auction data on component mount
    const fetchAuctionData = async () => {
      try {
        const token = getToken(); // Get token from localStorage
        if (!token) {
          alert("You need to login to view the auction.");
          return;
        }

        // Decode the token and store it in ref
        const decoded = JSON.parse(atob(token.split(".")[1]));
        decodedRef.current = decoded;

        const auctionData = await fetchAuctions(); // Fetch auctions using the API
        const processedAuctionData = auctionData.map((auction) => ({
          id: auction._id, // Use _id as id
          product: auction.product,
          currentBid: auction.currentBid,
          highestBidder: auction.highestBidder,
          timer: auction.timer,
          isActive: auction.isActive,
          buyNowActive: auction.isBuyNowLive ? true : false,
          isPlaceBidActive: auction.isActive === true ? true : false,
          buyNowTimer: auction.buyNowTimerLeft
            ? new Date(new Date(auction.buyNowTimerLeft))
            : null,
        }));

        setAuctions(processedAuctionData);
      } catch (error) {
        console.error("Error fetching auction data:", error);
        alert("Failed to fetch auction data.");
      }
    };

    // Fetch the auction data on component mount
    fetchAuctionData();

    // Listen for "update" event
    channel.bind("update", (data) => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === data.auctionId ? { ...auction, ...data } : auction
        )
      );
    });

    // Listen for "auctionEnd" event

    // channel.bind("auctionEnd", (data) => {
    //   const { auctionId, winner: auctionWinner } = data;
    //   setAuctions((prevAuctions) =>
    //     prevAuctions.map((auction) => {
    //       if (auction.id === auctionId) {
    //         return {
    //           ...auction,
    //           isPlaceBidActive: false, // Disable Place Bid for everyone
    //           buyNowActive: decodedRef.current?.email === auctionWinner, // Enable Buy Now for the winner
    //           isWinner:
    //             decodedRef.current?.email === auctionWinner
    //               ? auctionWinner
    //               : false,
    //           winner: auctionWinner, // Store winner
    //         };
    //       }
    //       return auction;
    //     })
    //   );
    // });

    channel.bind("auctionEnd", (data) => {
      const { auctionId, winner: auctionWinner } = data;
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => {
          if (auction.id === auctionId) {
            const isCurrentUserWinner =
              decodedRef.current?.email === auctionWinner;

            if (isCurrentUserWinner) {
              alert("You are the winner! Proceed to 'Buy Now'.");
            }

            return {
              ...auction,
              isPlaceBidActive: false,
              buyNowActive: isCurrentUserWinner,
              isWinner: isCurrentUserWinner,
              winner: auctionWinner,
              buyNowTimer: new Date(new Date().getTime() + 10 * 60 * 1000), // Set 5-minute Buy Now timer
            };
          }
          return auction;
        })
      );
    });

    // Cleanup function to unbind events on component unmount
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);

  // Place bid
    const placeBid = async (auctionId) => {
    console.log(auctionId, "iddddd");
    const auction = auctions.find((a) => a.id === auctionId);
    if (!auction || !auction.isPlaceBidActive) {
      alert("Bidding is currently disabled.");
      return;
    }

    const bidAmount = auction.currentBid + 5;
    const token = getToken();

    if (!token) {
      alert("You need to login to place a bid.");
      return;
    }

    try {
      // const data =   await fetch(`${API_URL}/auction/place-bid`, {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //     body: JSON.stringify({ auctionId, bidAmount }),
      //   });
      //   console.log(data, 'data');

      const response = await axios.post(
        `${API_URL}/auction/place-bid`,
        {
          auctionId,
          bidAmount,
          token,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response, "responsesssss");

      // if (response.data.status === 200) {
      //   console.log('Bid placed successfully');
      //   // Handle successful bid placement (e.g., update auction state)
      // } else {
      //   alert("Failed to place bid.");
      // }

       // If the bid is successfully placed, update the auction state to reflect the new highest bidder
    // setAuctions((prevAuctions) =>
    //   prevAuctions.map((auction) =>
    //     auction.id === auctionId
    //       ? {
    //           ...auction,
    //           currentBid: bidAmount,
    //           highestBidder: decodedRef.current?.email,
    //         }
    //       : auction
    //   )
    // );
    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid.");
    }
  };

  // Buy now
  const buyNow = async (auctionId) => {
    const auction = auctions.find((a) => a.id === auctionId);
    if (auction) {
      alert("Congratulations! You are the winner. Proceeding to purchase.");

      try {
        await fetch(`${API_URL}/auction/update-auction`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ auctionId }),
        });

        setAuctions((prevAuctions) =>
          prevAuctions.map((a) =>
            a.id === auctionId
              ? { ...a, buyNowActive: false, isPlaceBidActive: false }
              : a
          )
        );
      } catch (error) {
        console.error("Error processing buy now:", error);
        alert("Failed to complete the purchase.");
      }
    }
  };

  // Timer management
  useEffect(() => {
    const updateTimers = () => {
      const currentTime = new Date().getTime();

      setTimeLeft((prevTimeLeft) => {
        const newTimeLeft = {};
        auctions.forEach((auction) => {
          if (auction.buyNowTimer) {
            const remainingTime = auction.buyNowTimer.getTime() - currentTime;
            newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;

            if (remainingTime <= 0 && auction.buyNowActive) {

              console.log('byunodw eeeeeeeeeeeeeeeeeee')
              // Notify the server about expired "Buy Now"
          fetch(`${API_URL}/auction/buy-now-expired`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${getToken()}`,
                },
                body: JSON.stringify({ auctionId: auction.id }),
              }).catch((error) =>
                console.error("Error notifying buy now expiration:", error)
              );
            }
          }
        });
        return newTimeLeft;
      });
    };

    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, [auctions]);

  useEffect(() => {
    const expiredAuctions = auctions.filter(
      (auction) => timeLeft[auction.id] <= 0 && auction.buyNowActive
    );

    if (expiredAuctions.length > 0) {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) => {
          if (expiredAuctions.some((exp) => exp.id === auction.id)) {
            return {
              ...auction,
              buyNowActive: false,
              isPlaceBidActive: true,
            };
          }
          return auction;
        })
      );
    }
  }, [timeLeft, auctions]);

  return (
    <div className="auction-container">
      <h1>Auctions</h1>
      {auctions.map((auction) => {
        const remainingTime = timeLeft[auction.id] || 0;
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        return (
          <div className="auction-item" key={auction.id}>
            <p>Product: {auction.product}</p>
            <p>Current Bid: ${auction.currentBid}</p>
            <p>Highest Bidder: {auction.highestBidder}</p>
            <p>Time Remaining: {auction.timer} seconds</p>

            <button
              onClick={() => placeBid(auction.id)}
              disabled={!auction.isPlaceBidActive}
            >
              Place Bid
            </button>
{/*
            {auction.buyNowActive &&
              decodedRef.current?.email === auction.highestBidder && (
                <div>
                  <button
                    onClick={() => buyNow(auction.id)}
                    disabled={remainingTime <= 0}
                  >
                    Buy Now
                  </button>
                  {remainingTime > 0 ? (
                    <p>
                      Buy Now expires in: {minutes} minutes {seconds} seconds
                    </p>
                  ) : (
                    <p>Buy Now offer expired</p>
                  )}
                </div>
              )} */}

{auction.buyNowActive &&
              decodedRef.current?.email === auction.highestBidder && (
                <div>
                  <button
                    onClick={() => {
                      buyNow(auction.id);

                      setAuctions((prevAuctions) =>
                        prevAuctions.filter((a) => a.id !== auction.id)
                      );

                      setTimeLeft((prevTimeLeft) => ({
                        ...prevTimeLeft,
                        [auction.id]: 0,
                      }));
                    }}
                    disabled={remainingTime <= 0}
                  >
                    Buy Now
                  </button>
                  {remainingTime > 0 ? (
                    <p>
                      Buy Now expires in: {minutes} minutes {seconds} seconds
                    </p>
                  ) : (
                    <p>Buy Now offer expired</p>
                  )}
                </div>
              )}
          </div>
        );
      })}
    </div>
  );
};

// ------------------ working code as on 10 baje subhah -----------------------//

// import React, { useState, useEffect, useRef } from 'react';
// import axios from 'axios';
// import Pusher from 'pusher-js';
// import { getToken } from './auth'; // Assuming you have a function to fetch the auth token
// import { fetchAuctions } from './api'; // Replace with actual API call to fetch auction data

// const Auction = () => {
//   const [auctions, setAuctions] = useState([]);
//   const [timeLeft, setTimeLeft] = useState({});
//   const [auctionTimeLeft, setAuctionTimeLeft] = useState({});
//   const decodedRef = useRef(null);

//   useEffect(() => {
//     // Initialize Pusher
//     const pusher = new Pusher("0876dcda9524e34aab76", {
//       cluster: "ap2",
//     });

//     // Subscribe to the "auction" channel
//     const channel = pusher.subscribe("auction-channel");

//     // Fetch auction data on component mount
//     const fetchAuctionData = async () => {
//       try {
//         const token = getToken(); // Get token from localStorage
//         if (!token) {
//           alert("You need to login to view the auction.");
//           return;
//         }

//         // Decode the token and store it in ref
//         const decoded = JSON.parse(atob(token.split(".")[1]));
//         decodedRef.current = decoded;

//         const auctionData = await fetchAuctions(); // Fetch auctions using the API
//         const processedAuctionData = auctionData.map((auction) => ({
//           id: auction._id, // Use _id as id
//           product: auction.product,
//           currentBid: auction.currentBid,
//           highestBidder: auction.highestBidder,
//           timer: auction.timer,
//           auctionTimerLeft: auction.auctionTimerLeft
//             ? new Date(auction.buyNowTimerLeft)
//             : new Date(new Date().getTime() + 30 * 1000) ,// Added auctionTimerLeft
//           isActive: auction.isActive,
//           buyNowActive: auction.isBuyNowLive ? true : false,
//           isPlaceBidActive: auction.isActive === true ? true : false,
//           buyNowTimer: auction.buyNowTimerLeft
//             ? new Date(new Date(auction.buyNowTimerLeft))
//             : null,
//         }));

//         setAuctions(processedAuctionData);
//       } catch (error) {
//         console.error("Error fetching auction data:", error);
//         alert("Failed to fetch auction data.");
//       }
//     };

//     // Fetch auction data
//     fetchAuctionData();

//     // Listen for auction updates
//     channel.bind("update", (data) => {
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) =>
//           auction.id === data.auctionId ? { ...auction, ...data } : auction
//         )
//       );
//     });

//     // Listen for auctionEnd event
//     channel.bind("auctionEnd", (data) => {
//       const { auctionId, winner: auctionWinner } = data;
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (auction.id === auctionId) {
//             const isCurrentUserWinner =
//               decodedRef.current?.email === auctionWinner;
//             if (isCurrentUserWinner) {
//               alert("You are the winner! Proceed to 'Buy Now'.");
//             }
//             return {
//               ...auction,
//               isPlaceBidActive: false,
//               buyNowActive: isCurrentUserWinner,
//               isWinner: isCurrentUserWinner,
//               winner: auctionWinner,
//               buyNowTimer: new Date(new Date().getTime() + 10 * 60 * 1000), // Set 10-minute Buy Now timer
//               // auctionTimerLeft: 0, // Auction timer ends
//             };
//           }
//           return auction;
//         })
//       );
//     });

//     // Cleanup function to unbind events on component unmount
//     return () => {
//       channel.unbind_all();
//       channel.unsubscribe();
//     };
//   }, []);

//   // Place bid

//   // const placeBid = async (auctionId) => {
//   //   const auction = auctions.find((a) => a.id === auctionId);
//   //   if (!auction || !auction.isPlaceBidActive) {
//   //     alert("Bidding is currently disabled.");
//   //     return;
//   //   }

//   //   const bidAmount = auction.currentBid + 5;
//   //   const token = getToken();

//   //   if (!token) {
//   //     alert("You need to login to place a bid.");
//   //     return;
//   //   }

//   //   try {
//   //     const response = await axios.post(
//   //       `${API_URL}/auction/place-bid`,
//   //       {
//   //         auctionId,
//   //         bidAmount,
//   //         token,
//   //       },
//   //       {
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //         },
//   //       }
//   //     );
//   //     console.log(response, "Bid placed successfully");

//   //     // Update auction state with the new bid
//   //     setAuctions((prevAuctions) =>
//   //       prevAuctions.map((auction) =>
//   //         auction.id === auctionId
//   //           ? {
//   //               ...auction,
//   //               currentBid: bidAmount,
//   //               highestBidder: decodedRef.current?.email,
//   //               auctionTimerLeft: auction.auctionTimerLeft - 30, // Decrease auction time after each bid (example: 30 sec)
//   //             }
//   //           : auction
//   //       )
//   //     );
//   //   } catch (error) {
//   //     console.error("Error placing bid:", error);
//   //     alert("Failed to place bid.");
//   //   }
//   // };

//   const placeBid = async (auctionId) => {
//     const auction = auctions.find((a) => a.id === auctionId);
//     if (!auction || !auction.isPlaceBidActive) {
//       alert("Bidding is currently disabled.");
//       return;
//     }

//     const bidAmount = auction.currentBid + 5;
//     const token = getToken();

//     if (!token) {
//       alert("You need to login to place a bid.");
//       return;
//     }

//     try {
//       const response = await axios.post(
//         `${API_URL}/auction/place-bid`,
//         {
//           auctionId,
//           bidAmount,
//           token,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//           },
//         }
//       );
//       console.log(response, "Bid placed successfully");

//       // Update auction timer after placing bid
//       // setAuctionTimeLeft((prevAuctionTimeLeft) => {
//       //   const newTimeLeft = { ...prevAuctionTimeLeft };
//       //   const auction = auctions.find((a) => a.id === auctionId);
//       //   if (auction) {
//       //     const newTime = auction.auctionTimerLeft.getTime() - 1000; // Decrease by 1 second
//       //     newTimeLeft[auctionId] = newTime > 0 ? newTime : 0;
//       //   }
//       //   return newTimeLeft;

//       // Update auction timer after placing bid
//       setAuctionTimeLeft((prevAuctionTimeLeft) => {
//         const newTimeLeft = { ...prevAuctionTimeLeft };
//         const auction = auctions.find((a) => a.id === auctionId);

//       //   console.log(auction, 'auctionjjjjjj')
//       //   if (auction && auction.auctionTimerLeft) {
//       //     console.log(typeof(auction.auctionTimerLeft),'hiiiiiiiiiiiii')
//       //     const newTime = auction.auctionTimerLeft.getTime() - 1000; // Decrease by 1 second
//       //     newTimeLeft[auctionId] = newTime > 0 ? newTime : 0;
//       //   } else {
//       //     console.log("auctionTimerLeft is undefined for auctionId", auctionId);
//       //   }

//       //   return newTimeLeft;
//       // });


//       if (auction && auction.auctionTimerLeft) {
//         // Check if auction.auctionTimerLeft is a valid Date object
//         let auctionTimerLeft;

//         // If it's a string or invalid object, convert to Date
//         if (typeof auction.auctionTimerLeft === "string") {
//           auctionTimerLeft = new Date(auction.auctionTimerLeft);
//         } else if (auction.auctionTimerLeft instanceof Date) {
//           auctionTimerLeft = auction.auctionTimerLeft;
//         } else {
//           // If auctionTimerLeft is not valid, log an error and return unchanged
//           console.error("Invalid auctionTimerLeft:", auction.auctionTimerLeft);
//           return newTimeLeft;
//         }

//         // If it's still an invalid date, skip update
//         if (isNaN(auctionTimerLeft.getTime())) {
//           console.error("Invalid Date:", auction.auctionTimerLeft);
//           return newTimeLeft;
//         }


//         // Decrease by 1 second
//         const newTime = auctionTimerLeft.getTime() - 1000;
//         newTimeLeft[auctionId] = newTime > 0 ? newTime : 0;
//       } else {
//         console.log("auctionTimerLeft is undefined or invalid for auctionId", auctionId);
//       }
//       console.log(auction, 'hapyyyyy');

//       return newTimeLeft;
//       });


//     } catch (error) {
//       console.error("Error placing bid:", error);
//       alert("Failed to place bid.");
//     }
//   };

//   // Place bid

//   // Timer management for auctionTimerLeft

//   // useEffect(() => {
//   //   const updateTimers = () => {
//   //     const currentTime = new Date().getTime();

//   //     setTimeLeft((prevTimeLeft) => {
//   //       const newTimeLeft = {};
//   //       auctions.forEach((auction) => {
//   //         if (auction.auctionTimerLeft) {
//   //           const remainingTime = auction.auctionTimerLeft - currentTime;
//   //           newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;

//   //           if (remainingTime <= 0 && auction.isActive) {
//   //             // Notify the server about expired auction timer
//   //             fetch(`${API_URL}/auction/auction-timer-expired`, {
//   //               method: "POST",
//   //               headers: {
//   //                 "Content-Type": "application/json",
//   //                 Authorization: `Bearer ${getToken()}`,
//   //               },
//   //               body: JSON.stringify({ auctionId: auction.id }),
//   //             }).catch((error) =>
//   //               console.error("Error notifying auction timer expiration:", error)
//   //             );
//   //           }
//   //         }
//   //       });
//   //       return newTimeLeft;
//   //     });
//   //   };

//   //   const interval = setInterval(updateTimers, 1000);
//   //   return () => clearInterval(interval);
//   // }, [auctions]);

//   //  00000000000000000 4baje 

//   // useEffect(() => {
//   //   const updateAuctionTimers = () => {
//   //     const currentTime = new Date().getTime();

//   //     setAuctionTimeLeft((prevAuctionTimeLeft) => {
//   //       const newAuctionTimeLeft = {};
//   //       auctions.forEach((auction) => {
//   //         console.log(auction, 'acutionnnnnnnnnnn')
//   //         if (auction.auctionTimerLeft) {
//   //           const remainingTime =
//   //             auction.auctionTimerLeft.getTime() - currentTime;
//   //           newAuctionTimeLeft[auction.id] =
//   //             remainingTime > 0 ? remainingTime : 0;

//   //           if (remainingTime <= 0) {
//   //             console.log("Auction time expired for:", auction.id);
//   //             // Notify server about auction end
//   //             fetch(`${API_URL}/auction/end-auction`, {
//   //               method: "POST",
//   //               headers: {
//   //                 "Content-Type": "application/json",
//   //                 Authorization: `Bearer ${getToken()}`,
//   //               },
//   //               body: JSON.stringify({ auctionId: auction.id }),
//   //             }).catch((error) =>
//   //               console.error("Error notifying auction end:", error)
//   //             );
//   //           }
//   //         }
//   //       });
//   //       return newAuctionTimeLeft;
//   //     });
//   //   };

//   //   const interval = setInterval(updateAuctionTimers, 1000);
//   //   return () => clearInterval(interval);
//   // }, [auctions]);


//   // useEffect(() => {
//   //   const updateAuctionTimers = () => {
//   //     const currentTime = new Date().getTime();
  
//   //     setAuctionTimeLeft((prevAuctionTimeLeft) => {
//   //       const newAuctionTimeLeft = { ...prevAuctionTimeLeft };
//   // let auctionTimerLeft;
//   //       auctions.forEach((auction) => {
//   //         console.log(auction, 'acutionnnnnnn')
//   //         if (auction.auctionTimerLeft != null || typeof (auction.auctionTimerLeft) != 'string' || auction.auctionTimerLeft != undefined) {
//   //           // Check if this is the auction you need to update (target specific auction)
            
//   //           if (typeof auction.auctionTimerLeft === "string") {
//   //             auctionTimerLeft = new Date(auction.auctionTimerLeft);
            
//   //           const remainingTime =
//   //             auction.auctionTimerLeft.getTime() - currentTime;
  
//   //           if (newAuctionTimeLeft[auction.id] !== remainingTime) {
//   //             // Only update if the time has changed (avoids unnecessary re-renders)
//   //             newAuctionTimeLeft[auction.id] =
//   //               remainingTime > 0 ? remainingTime : 0;
//   //           }
  
//   //           if (remainingTime <= 0) {
//   //             console.log("Auction time expired for:", auction.id);
//   //             // Notify server about auction end
//   //             fetch(`${API_URL}/auction/end-auction`, {
//   //               method: "POST",
//   //               headers: {
//   //                 "Content-Type": "application/json",
//   //                 Authorization: `Bearer ${getToken()}`,
//   //               },
//   //               body: JSON.stringify({ auctionId: auction.id }),
//   //             }).catch((error) =>
//   //               console.error("Error notifying auction end:", error)
//   //             );
//   //           }
//   //         }
//   //       });
  
//   //       return newAuctionTimeLeft;
//   //     });
//   //   };
  
//   //   const interval = setInterval(updateAuctionTimers, 1000);
//   //   return () => clearInterval(interval);
//   // }, [auctions]); // Ensure to re-run the effect when auctions change
  

//   useEffect(() => {
//     const updateAuctionTimers = () => {
//       const currentTime = new Date().getTime();
  
//       setAuctionTimeLeft((prevAuctionTimeLeft) => {
//         const newAuctionTimeLeft = { ...prevAuctionTimeLeft };
  
//         auctions.forEach((auction) => {
//           try {
//             let auctionTimerLeft;
  
//             // Check if auction.auctionTimerLeft is defined
//             if (!auction.auctionTimerLeft) {
//               console.warn(`auctionTimerLeft is missing for auction ID: ${auction.id}`);
//               return;
//             }
  
//             // Parse auction.auctionTimerLeft into a Date object if it's a string
//             if (typeof auction.auctionTimerLeft === "string") {
//               auctionTimerLeft = new Date(auction.auctionTimerLeft);
//             } else if (auction.auctionTimerLeft instanceof Date) {
//               auctionTimerLeft = auction.auctionTimerLeft;
//             } else {
//               console.error("Invalid auctionTimerLeft format:", auction.auctionTimerLeft);
//               return;
//             }
  
//             // Validate the parsed Date
//             if (isNaN(auctionTimerLeft.getTime())) {
//               console.error("Invalid Date after parsing auctionTimerLeft:", auction.auctionTimerLeft);
//               return;
//             }
  
//             // Calculate remaining time
//             const remainingTime = auctionTimerLeft.getTime() - currentTime;
  
//             if (newAuctionTimeLeft[auction.id] !== remainingTime) {
//               // Only update if the time has changed
//               newAuctionTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;
//             }
  
//             if (remainingTime <= 0) {
//               console.log("Auction time expired for:", auction.id);
  
//               // Notify server about auction end
//               fetch(`${API_URL}/auction/end-auction`, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${getToken()}`,
//                 },
//                 body: JSON.stringify({ auctionId: auction.id }),
//               }).catch((error) =>
//                 console.error("Error notifying auction end:", error)
//               );
//             }
//           } catch (error) {
//             console.error(`Error processing auction ID ${auction.id}:`, error);
//           }
//         });
  
//         return newAuctionTimeLeft;
//       });
//     };
  
//     const interval = setInterval(updateAuctionTimers, 1000);
//     return () => clearInterval(interval);
//   }, [auctions]);
  

//   // Timer management for auctionTimerLeft

//   //  ----------------- Timer management for buyNowTimerLeft

//   //   // Buy now

//   const buyNow = async (auctionId) => {
//     const auction = auctions.find((a) => a.id === auctionId);
//     if (auction) {
//       alert("Congratulations! You are the winner. Proceeding to purchase.");

//       try {
//         await fetch(`${API_URL}/auction/update-auction`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${getToken()}`,
//           },
//           body: JSON.stringify({ auctionId }),
//         });

//         setAuctions((prevAuctions) =>
//           prevAuctions.map((a) =>
//             a.id === auctionId
//               ? { ...a, buyNowActive: false, isPlaceBidActive: false }
//               : a
//           )
//         );
//       } catch (error) {
//         console.error("Error processing buy now:", error);
//         alert("Failed to complete the purchase.");
//       }
//     }
//   };

//   useEffect(() => {
//     const updateTimers = () => {
//       const currentTime = new Date().getTime();

//       setTimeLeft((prevTimeLeft) => {
//         const newTimeLeft = {};
//         auctions.forEach((auction) => {
//           if (auction.buyNowTimer) {
//             const remainingTime = auction.buyNowTimer.getTime() - currentTime;
//             newTimeLeft[auction.id] = remainingTime > 0 ? remainingTime : 0;

//             if (remainingTime <= 0 && auction.buyNowActive) {
//               console.log("byunodw eeeeeeeeeeeeeeeeeee");
//               // Notify the server about expired "Buy Now"
//               fetch(`${API_URL}/auction/buy-now-expired`, {
//                 method: "POST",
//                 headers: {
//                   "Content-Type": "application/json",
//                   Authorization: `Bearer ${getToken()}`,
//                 },
//                 body: JSON.stringify({ auctionId: auction.id }),
//               }).catch((error) =>
//                 console.error("Error notifying buy now expiration:", error)
//               );
//             }
//           }
//         });
//         return newTimeLeft;
//       });
//     };

//     const interval = setInterval(updateTimers, 1000);
//     return () => clearInterval(interval);
//   }, [auctions]);

//   useEffect(() => {
//     const expiredAuctions = auctions.filter(
//       (auction) => timeLeft[auction.id] <= 0 && auction.buyNowActive
//     );

//     if (expiredAuctions.length > 0) {
//       setAuctions((prevAuctions) =>
//         prevAuctions.map((auction) => {
//           if (expiredAuctions.some((exp) => exp.id === auction.id)) {
//             return {
//               ...auction,
//               buyNowActive: false,
//               isPlaceBidActive: true,
//             };
//           }
//           return auction;
//         })
//       );
//     }
//   }, [timeLeft, auctions]);

//   //  ----------------- Timer management for buyNowTimerLeft

//   // Render auctions
//   return (
//     <div className="auction-container">
//       <h1>Auctions</h1>
//       {auctions.map((auction) => {
//         const auctionRemainingTime = timeLeft[auction.id] || 0;
//         const minutes = Math.floor(auctionRemainingTime / 60000);
//         const seconds = Math.floor((auctionRemainingTime % 60000) / 1000);

//         const remainingAuctionTime = auctionTimeLeft[auction.id] || 0;
//         const auctionminutes = Math.floor(remainingAuctionTime / 60000);
//         const auctionseconds = Math.floor(
//           (remainingAuctionTime % 60000) / 1000
//         );
//         return (
//           <div className="auction-item" key={auction.id}>
//             <p>Product: {auction.product}</p>
//             <p>Current Bid: ${auction.currentBid}</p>
//             <p>Highest Bidder: {auction.highestBidder}</p>

//             <p>
//               Auction Timer Remaining: {auctionminutes} minutes {auctionseconds}{" "}
//               seconds
//             </p>

//             <button
//               onClick={() => placeBid(auction.id)}
//               disabled={!auction.isPlaceBidActive}
//             >
//               Place Bid
//             </button>

//             {auction.buyNowActive &&
//               decodedRef.current?.email === auction.highestBidder && (
//                 <div>
//                   <button
//                     onClick={() => buyNow(auction.id)}
//                     disabled={auctionRemainingTime <= 0}
//                   >
//                     Buy Now
//                   </button>
//                   {auctionRemainingTime > 0 ? (
//                     <p>
//                       Buy Now expires in: {minutes} minutes {seconds} seconds
//                     </p>
//                   ) : (
//                     <p>Buy Now offer expired</p>
//                   )}
//                 </div>
//               )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default Auction;

export default Auction;
