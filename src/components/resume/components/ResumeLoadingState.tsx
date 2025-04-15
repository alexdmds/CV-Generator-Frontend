
import React from "react";

export function ResumeLoadingState() {
  return (
    <div className="text-center py-8">
      <div className="w-12 h-12 mx-auto border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
      <p className="mt-4 text-gray-500">Chargement de vos CVs...</p>
    </div>
  );
}
