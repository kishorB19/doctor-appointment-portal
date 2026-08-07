import React from 'react';
import './index.css';
import { FaInstagramSquare, FaLinkedin, FaGithubSquare, FaPhoneAlt, FaEnvelope } from "react-icons/fa";

const TopHeader = () => {
    return (
        <div id="topbar" className="d-flex align-items-center fixed-top">
            <div className="container d-flex justify-content-between">
                <div className="contact-info d-flex align-items-center">
                    <FaEnvelope className='contact-icon'/> <a href="mailto:kishor1912.b@gmail.com">kishor1912.b@gmail.com</a>
                    <FaPhoneAlt className='contact-icon'/> <a href="tel:8788366909">8788366909</a> 
                </div>
                <div className="d-none d-lg-flex social-links align-items-center">
                    <a href="https://www.linkedin.com/in/kishor-birajdar-5bb25a287/" target='_blank' rel="noreferrer" className="linkedin"><FaLinkedin /></a>
                    <a href="https://github.com/KishorBirajdar" target='_blank' rel="noreferrer" className="github"><FaGithubSquare /></a>
                    <a href="https://www.instagram.com/kishor_birajdar19/" target='_blank' rel="noreferrer" className="instagram"><FaInstagramSquare /></a>
                </div>
            </div>
        </div>
    );
};
export default TopHeader;