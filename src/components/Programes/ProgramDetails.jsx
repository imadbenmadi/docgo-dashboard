import React from "react";
import { Edit, Trash2 } from "lucide-react";

const ProgramDetails = ({
  selectedProgram,
  setCurrentPage,
  handleEdit,
  handleDelete,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
            Program Details
          </h1>
          <button
            onClick={() => setCurrentPage("programs")}
            className="bg-gray-600 text-white px-6 py-3 rounded-full hover:bg-gray-700 transition-transform transform hover:scale-105 shadow-md"
          >
            Back to Programs
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <img
            src={selectedProgram.image}
            alt={selectedProgram.title}
            className="w-full h-72 object-cover transition-transform duration-300 hover:scale-105"
          />
          <div className="p-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {selectedProgram.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">Price</h3>
                  <p className="text-3xl font-extrabold text-blue-600">
                    {selectedProgram.price}
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Country
                  </h3>
                  <p className="text-gray-600">{selectedProgram.country}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Duration
                  </h3>
                  <p className="text-gray-600">{selectedProgram.duration}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    University
                  </h3>
                  <p className="text-gray-600">{selectedProgram.university}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    Application Deadline
                  </h3>
                  <p className="text-gray-600">
                    {selectedProgram.applicationDeadline || "Not specified"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Description
              </h3>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: selectedProgram.description,
                }}
              />
            </div>

            <div className="mb-8">
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Requirements
              </h3>
              <div
                className="prose max-w-none text-gray-700"
                dangerouslySetInnerHTML={{
                  __html: selectedProgram.requirements,
                }}
              />
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleEdit(selectedProgram)}
                className="bg-yellow-500 text-white py-3 px-6 rounded-lg hover:bg-yellow-600 transition-transform transform hover:scale-105 flex items-center gap-2 shadow-md"
              >
                <Edit size={20} />
                Edit Program
              </button>
              <button
                onClick={() => handleDelete(selectedProgram.id)}
                className="bg-red-500 text-white py-3 px-6 rounded-lg hover:bg-red-600 transition-transform transform hover:scale-105 flex items-center gap-2 shadow-md"
              >
                <Trash2 size={20} />
                Delete Program
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgramDetails;
