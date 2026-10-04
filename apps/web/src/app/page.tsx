"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, getSession } from "next-auth/react";
import Image from 'next/image';

import HeaderWelcome from "../components/headers/HeaderWelcome";
import '../styles/welcome.css';

import bag from '../images/first_page/bag.svg';
import ball from '../images/first_page/ball.svg';
import bank from '../images/first_page/bank.svg';
import heart from '../images/first_page/heart.svg';
import green from '../images/first_page/green.svg';
import fire from '../images/first_page/fire.svg';
import gamepad from '../images/first_page/gamepad.svg';
import guitar from '../images/first_page/guitar.svg';
import hat from '../images/first_page/hat.svg';
import light from '../images/first_page/light.svg';
import like from '../images/first_page/like.svg';
import tent from '../images/first_page/tent.svg';
import smile from '../images/first_page/smile.svg'
import hand from '../images/first_page/hand.svg'
import ship from '../images/first_page/ship.svg'

const Welcome = () => {
    const { status } = useSession();
    const router = useRouter();

    useEffect(() => {
        document.documentElement.style.overflow = "hidden";
        return () => {
            document.documentElement.style.overflow = "";
        };
    }, []);

    useEffect(() => {
        const fetchToken = async () => {
            const session = await getSession();
            console.log("Session from NextAuth:", session);
        };

        fetchToken();
    }, []);

    const handleClick = () => {
        if (status === 'authenticated') {
            router.push('/explore')
        } else {
            router.push('/login')
        }
    }

    return (
        <div className="welcome">
            <HeaderWelcome />
            <div className="info-container">
                <div className="info">
                    <div className="info-title">
                        <h1>Join the Chatvolution</h1>
                    </div>
                    <div className="info-text">
                        <p>Ask questions, share ideas, and build connections with each other.</p>
                    </div>
                    <div className="info-button" onClick={handleClick}>
                        <a>Join Content Master Community <Image src={ship} alt="ship"></Image></a>
                    </div>
                </div>
            </div>
            <div className="circles-container">
                <div className="circle-1 circle">
                    <div className="emoji-greyBackground greyBackground">
                        <Image src={hat} alt="hat"></Image>
                    </div>
                    <div className="emoji-greyBackground greyBackground">
                        <Image src={fire} alt="fire"></Image>
                    </div>
                    <div className="circle-2 circle">
                        <div className="emoji-container">
                            <Image src={heart} alt="heart"></Image>
                        </div>
                        <div className="emoji-greyBackground greyBackground">
                            <Image src={bank} alt="bank"></Image>
                        </div>
                        <div className="emoji-greyBackground greyBackground">
                            <Image src={guitar} alt="guitar"></Image>
                        </div>
                        <div className="emoji-container">
                            <Image src={green} alt="green"></Image>
                        </div>
                        <div className="emoji-container">
                            <Image src={green} alt="green"></Image>
                        </div>
                        <div className="emoji-greyBackground greyBackground">
                            <Image src={ball} alt="ball"></Image>
                        </div>
                        <div className="circle-3 circle">
                            <div className="emoji-greyBackground greyBackground">
                                <Image src={bag} alt="bag"></Image>
                            </div>
                            <div className="emoji-greyBackground greyBackground">
                                <Image src={tent} alt="tent"></Image>
                            </div>
                            <div className="emoji-greyBackground greyBackground">
                                <Image src={gamepad} alt="gamepad"></Image>
                            </div>
                            <div className="emoji-greyBackground greyBackground">
                                <Image src={light} alt="light"></Image>
                            </div>
                            <div className="emoji-container">
                                <Image src={heart} alt="heart"></Image>
                            </div>
                            <div className="circle-4 circle">
                                <div className="emoji-greyBackground greyBackground">
                                    <Image src={like} alt="like"></Image>
                                </div>
                                <div className="emoji-greyBackground greyBackground">
                                    <Image src={smile} alt="smile"></Image>
                                </div>
                                <div className="emoji-greyBackground greyBackground">
                                    <Image src={hand} alt="hand"></Image>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Welcome;