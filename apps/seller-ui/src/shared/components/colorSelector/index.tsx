import { Plus } from "lucide-react";
import { useState } from "react";
import { Controller } from "react-hook-form";

const defaultColors = [
  "#ffffff",
  "#000000",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
];

const ColorSelector = ({ control, errors }: any) => {
  const [customColors, setCustomColors] = useState<string[]>([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [newColor, setNewColor] = useState("#ffffff");

  return (
    <div className="mt-2">
      <label className="block font-semibold text-gray-300 mb-1">Colors</label>
      <Controller
        name="colors"
        control={control}
        render={({ field }) => (
          <div className="flex flex-wrap gap-3">
            {[...defaultColors, ...customColors].map((color, index) => {
              const isSelected = (field.value || []).includes(color);
              const isLightColor = ["#ffffff", "#ffff00"].includes(color);
              return (
                <button
                  type="button"
                  key={index}
                  onClick={() =>
                    field.onChange(
                      isSelected
                        ? field.value.filter((c: string) => c !== color)
                        : [...(field.value || []), color]
                    )
                  }
                  className={`w-7 h-7 p-2 rounded-md my-1 flex items-center justify-center border-2 transition ${
                    isSelected ? "scale-110 border-white" : "border-transparent"
                  } ${isLightColor ? "border-gray-600" : ""}`}
                  style={{
                    backgroundColor: color,
                  }}
                />
              );
            })}
            {/* Add new color */}
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border-2 border-gray-500 bg-gray-800 hover:bg-gray-700 transition"
              onClick={() => setShowColorPicker(!showColorPicker)}
            >
              <Plus size={16} color="white" />
            </button>
            {/* color picker */}
            {showColorPicker && (
              <div className="relative flex items-center gap-2">
                <input
                  type="color"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-10 h-14 cursor-pointer p-0"
                />
                <button
                  type="button"
                  className="px-3 py-1 bg-gray-700 text-white rounded-md text-sm"
                  onClick={() => {
                    setCustomColors([...customColors, newColor]);
                    setShowColorPicker(false);
                  }}
                >
                  ADD
                </button>
              </div>
            )}
          </div>
        )}
      />
      {errors?.colors && (
        <p className="text-red-500 text-xs mt-1">
          {errors.colors.message as string}
        </p>
      )}
    </div>
  );
};

export default ColorSelector;
