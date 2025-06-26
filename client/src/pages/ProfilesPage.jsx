import React from "react";
import { useParams } from "react-router-dom";

export default function ProfilesPage() {
  const params = useParams();

  return (
    <div>
      <h1>Profile Page {params.profileId}</h1>
    </div>
  );
}
