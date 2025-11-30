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

  const handleOneThingSave = (value: string) => {
    setShowOneThing(false);
    localStorage.setItem("todayOneThing", value);
    navigate("/tracker");
  };

  const handleOneThingClose = () => {
    setShowOneThing(false);
    navigate("/tracker");
  };

  return (
    <>
      <AffirmationModal isOpen={showAffirmation} onClose={handleAffirmationClose} />
      <OneThingModal 
        isOpen={showOneThing} 
        onClose={handleOneThingClose}
        onSave={handleOneThingSave}
      />
    </>
  );
};

export default Index;
