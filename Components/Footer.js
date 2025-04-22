'use client'
import React from 'react'
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa'
import { FiPhone } from 'react-icons/fi'

function Footer() {
    return (
        <footer className="bg-blue-500  text-black rounded-3xl p-8 mt-16">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand */}
                <div>
                    <h2 className="text-2xl font-bold">
                        <span className="text-white text-3xl">GloBus </span>
                    </h2>
                    <p className=" mt-2">
                        Experience the ease and convenience of renting a car with DriverLy.
                    </p>
                </div>

                {/* Legal Policy */}
                <div className='text-black'>
                    <h3 className="font-semibold mb-2">Legal Policy</h3>
                    <ul className="space-y-1 ">
                        <li>Term & Condition</li>
                        <li>Privacy Policy</li>
                        <li>Legal Notice</li>
                        <li>Accessibility</li>
                    </ul>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="font-semibold mb-2">Quick Links</h3>
                    <ul className="space-y-1 ">
                        <li>Home</li>
                        <li>About Us</li>

                        <li>Service</li>
                    </ul>
                </div>

                {/* Newsletter */}
                <div>
                    <h3 className="font-semibold mb-2">Subscribe To The Newsletters</h3>
                    <div className="flex items-center space-x-2 mt-2">
                        <input
                            type="email"
                            placeholder="Email..."
                            className="input input-bordered w-full bg-gray-800 text-white border-none p-2 rounded-2xl"
                        />
                        <button className="btn bg-red-500 border-none hover:bg-red-600 text-white h-12 w-12 rounded-full">
                            <span>➝</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="flex flex-col md:flex-row justify-between items-center mt-8 border-t border-gray-700 pt-4">
                <p className=" text-sm">© 2025 GloBus. All rights reserved.</p>
                <div className="flex space-x-4 text-xl mt-4 md:mt-0">
                    <FiPhone className="cursor-pointer" />
                    <FaFacebookF className="cursor-pointer" />
                    <FaInstagram className="cursor-pointer" />
                    <FaLinkedinIn className="cursor-pointer" />
                </div>
            </div>
        </footer>
    )
}

export default Footer
