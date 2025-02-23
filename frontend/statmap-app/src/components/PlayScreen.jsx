import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import WorldMap from "../World_map.svg";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import Login from "./Login";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// Sample list of countries
const countries = [
    "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
    "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
    "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
    "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
    "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
    "Canada", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
    "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark",
    "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
    "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
    "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
    "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary",
    "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
    "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
    "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
    "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
    "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
    "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
    "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
    "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
    "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
    "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
    "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
    "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
    "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname",
    "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
    "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
    "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
    "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
    "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const PlayScreen = () => {
    const [selectedCountry, setSelectedCountry] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate();

    // Sort countries alphabetically.
    const sortedCountries = [...countries].sort();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Selected country:", selectedCountry);
    };

    const handleOpenModal = () => {
        console.log("Opening modal");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log("Closing modal");
        setIsModalOpen(false);
    };
    const handleBack = () => {
        navigate("/");
    };

    return (
        <div
            style={{
                backgroundImage: `url(${WorldMap})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                minHeight: "100vh",
                position: "relative"
            }}
        >
            {/* Hover Menu in top left */}
            <HoverDropMenu onSignInClick={handleOpenModal} />

            {/* Back Button in top right */}
            <div
                style={{
                    position: "absolute",
                    top: "40px",
                    right: "40px",
                    zIndex: 50,
                }}
            >
                <Button
                    onClick={handleBack}
                    style={{
                        backgroundColor: "black",
                        color: "white",
                        borderColor: "white",
                        borderRadius: "30px",
                        padding: "0.5rem 1rem",
                    }}
                    className="hover:bg-white hover:text-black"
                >
                    <FaArrowLeft size={40} />
                </Button>
            </div>

            {/* Overlay container */}
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "3rem",
                    borderRadius: "12px",
                    width: "90%",
                    maxWidth: "700px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}
            >
                {/* Fact placeholder */}
                <div
                    style={{
                        marginBottom: "1.5rem",
                        padding: "1rem",
                        border: "1px solid #ccc",
                        borderRadius: "4px"
                    }}
                >
                    <p style={{ textAlign: "center", color: "#333" }}>
                        Fact goes here!
                    </p>
                </div>
                {/* Form for country selection */}
                <Form onSubmit={handleSubmit}>
                    <div style={{ textAlign: "center" }}>
                        <Form.Group
                            controlId="countrySelect"
                            className="mb-4"
                            style={{ display: "inline-block", textAlign: "left", maxWidth: "300px", width: "100%" }}
                        >
                            <Form.Label style={{ fontWeight: "bold" }}>
                                Select a country:
                            </Form.Label>
                            <Form.Control
                                as="select"
                                value={selectedCountry}
                                onChange={(e) => setSelectedCountry(e.target.value)}
                                style={{
                                    backgroundColor: "#f0f0f0", 
                                    color: "#333",
                                    border: "1px solid #ccc"
                                }}
                            >
                                <option value="">-- Choose a country --</option>
                                {sortedCountries.map((country) => (
                                    <option key={country} value={country}>
                                        {country}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <Button
                            type="submit"
                            style={{
                                backgroundColor: "black",
                                color: "white",
                                borderColor: "white",
                                borderRadius: "30px",
                                width: "60%",
                                padding: "0.75rem 1rem"
                            }}
                            className="hover:bg-white hover:text-black"
                        >
                            Submit
                        </Button>
                    </div>
                </Form>
            </div>

            {/* Login Modal */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                <Login />
            </Modal>
        </div>
    );
};

export default PlayScreen;



