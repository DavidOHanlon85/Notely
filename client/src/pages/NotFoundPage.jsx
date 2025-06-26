import React from "react";
import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <div>
      <h1>
        404 Not Found
        <Link to="/">Home from Link</Link>
      </h1>
    </div>
  );
}
