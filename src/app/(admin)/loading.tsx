import SpinnerLarge from "@/components/common/SpinnerLarge";
import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <SpinnerLarge />
    </div>
  );
};

export default Loading;
