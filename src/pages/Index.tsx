import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AffirmationModal from "@/components/AffirmationModal";
import OneThingModal from "@/components/OneThingModal";

const Index = () => {
  const navigate = useNavigate();
  const [showAffirmation, setShowAffirmation] = useState(true);
  const [showOneThing, setShowOneThing] = useState(false);

  const handleAffirmationClose = () => {
    setShowAffirmation(false);
    setShowOneThing(true);
  };

  const handleOneThingClose = (value: string) => {
    setShowOneThing(false);
    // Store the one-thing value (could be in localStorage or state management)
    localStorage.setItem("todayOneThing", value);
    // Redirect to main tracker page
    navigate("/");
  };

  return (
    <>
      <AffirmationModal isOpen={showAffirmation} onClose={handleAffirmationClose} />
      <OneThingModal isOpen={showOneThing} onClose={handleOneThingClose} />
    </>
  );
};

export default Index;
