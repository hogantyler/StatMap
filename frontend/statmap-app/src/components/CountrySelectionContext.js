/* js context for communicating which country is selected from the conicglobe component to gameplay pages.
   Creates the context, defines and provides the values of the context which includes its state and set state function as well as its custom useCountrySelection
   usecontext hook. Created with the help of an LLM*/

import React, { createContext, useState, useContext } from 'react';

// Create the context
const CountrySelectionContext = createContext();

// Create a provider component
export const CountrySelectionProvider = ({ children }) => {
  const [selectedCountry, setSelectedCountry] = useState(null);

  // Function to update the selected country
  const selectCountry = (countryName) => {
    setSelectedCountry(countryName);
  };

  // Value object that will be passed to consumer components
  const value = {
    selectedCountry,
    selectCountry
  };

  return (
    <CountrySelectionContext.Provider value={value}>
      {children}
    </CountrySelectionContext.Provider>
  );
};

// Custom hook for consuming the context
export const useCountrySelection = () => {
  const context = useContext(CountrySelectionContext);
  if (context === undefined) {
    throw new Error('useCountrySelection must be used within a CountrySelectionProvider');
  }
  return context;
};