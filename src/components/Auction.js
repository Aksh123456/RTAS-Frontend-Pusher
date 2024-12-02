// this code is working

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Pusher from "pusher-js";
import { fetchAuctions } from "../api/auction"; 
import { getToken } from "../api/token";
import "../css/Auction.css";  

const API_URL = process.env.REACT_APP_API_URL;



const Auction = () => {
  const [auctions, setAuctions] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});

  const decodedRef = useRef(null);


  useEffect(() => {
    
    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
    });

    
    const channel = pusher.subscribe("auction-channel");

    
    const fetchAuctionData = async () => {
      try {
        const token = getToken(); 
        if (!token) {
          alert("You need to login to view the auction.");
          return;
        }

        
        const decoded = JSON.parse(atob(token.split(".")[1]));
        decodedRef.current = decoded;

        const auctionData = await fetchAuctions(); 
        const processedAuctionData = auctionData.map((auction) => ({
          id: auction._id, 
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

    
    fetchAuctionData();

  
    channel.bind("update", (data) => {
      setAuctions((prevAuctions) =>
        prevAuctions.map((auction) =>
          auction.id === data.auctionId ? { ...auction, ...data } : auction
        )
      );
    });

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
              buyNowTimer: new Date(new Date().getTime() + 10 * 60 * 1000),
            };
          }
          return auction;
        })
      );
    });

    
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
    };
  }, []);


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

    } catch (error) {
      console.error("Error placing bid:", error);
      alert("Failed to place bid.");
    }
  };

  
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


export default Auction;
