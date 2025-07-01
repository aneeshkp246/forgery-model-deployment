'use client';

import { useState, ChangeEvent } from 'react';

const DeepfakeDetector = () => {
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [results, setResults] = useState<{ filename: string; label: string; confidence?: number }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setImages(selectedFiles);
    setResults([]);

    const readers = selectedFiles.map(file => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(setPreviews);
  };

  const handleSubmit = async () => {
    if (images.length === 0) return;

    const formData = new FormData();
    images.forEach(img => formData.append('files', img));
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/multi_predict", {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errText}`);
      }

      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Prediction failed:", err);
      alert("Prediction failed. See console for details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    if (!results.length) return;
    const headers = ['Filename', 'Label', 'Confidence'];
    const rows = results.map(r => [r.filename, r.label, (r.confidence ?? '').toString()]);
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'deepfake_results.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🕵️‍♂️ Deepfake Image Detector</h1>
          <p className="text-gray-600">Upload multiple images to detect AI-generated faces</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              id="file-upload"
            />
            <label 
              htmlFor="file-upload"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
            >
              <div className="text-center">
                <div className="text-3xl mb-2">📁</div>
                <p className="text-gray-600 font-medium">Click to upload images</p>
                <p className="text-sm text-gray-400">PNG, JPG, JPEG - Max 10MB each</p>
              </div>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {previews.map((url, idx) => (
                <img key={idx} src={url} alt={`Preview ${idx}`} className="rounded-xl shadow-md object-contain max-h-40" />
              ))}
            </div>
          )}

          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={images.length === 0 || loading}
              className={`px-8 py-3 rounded-xl text-white font-semibold text-lg transition-all duration-200 ${
                loading || images.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:scale-105'
              }`}
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing...</span>
                </div>
              ) : (
                'Predict'
              )}
            </button>

            {results.length > 0 && (
              <button
                onClick={downloadCSV}
                className="px-6 py-3 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 transition"
              >
                Download CSV
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="space-y-6">
              {results.map((res, idx) => (
                <div key={idx} className="bg-gray-50 rounded-xl p-6 border-l-4 border-blue-500">
                  <h2 className="text-xl font-bold text-gray-800 mb-2">{res.filename}</h2>
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-lg font-semibold ${
                    res.label === 'Real' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    <span className="mr-2">{res.label === 'Real' ? '✅' : '⚠️'}</span>
                    {res.label}
                  </div>
                  {typeof res.confidence === 'number' && (
                    <div className="mt-3">
                      <p className="text-gray-700">Confidence: <b>{(res.confidence * 100).toFixed(1)}%</b></p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeepfakeDetector;
