// import React from 'react';
// import { Loader } from 'lucide-react';

// interface Props {
//   tarnslation: any;
//   categoriesLoading: any;
//   categories: any;
//   setminPrice: any;
//   setmaxPrice: any;
//   maxPrice: any;
//   minPrice: any;
//   checked: any;
//   setChecked: any;
// }

// const FilterOnlyCategories: React.FC<Props> = ({
//   tarnslation,
//   categories,
//   categoriesLoading,
//   setminPrice,
//   setmaxPrice,
//   maxPrice,
//   minPrice,
//   checked,
//   setChecked,
// }) => {
//   return (
//     <section className="flex flex-col w-full lg:max-w-[330px]">

//       {/* Desktop Filter - always visible on desktop */}
//       <div className="hidden md:flex overflow-hidden flex-col px-5 py-6 mt-5 w-full rounded-3xl border border-solid border-black border-opacity-10">
//         <div className="flex flex-col mt-2 text-black whitespace-nowrap gap-4">

//           {categoriesLoading ? (
//             <Loader />
//           ) : (
//             categories?.map((categoryItem: any) => (
//               <DropdownItem key={categoryItem.id} data={categoryItem} />
//             ))
//           )}

//           {/* Price Filter */}
//           <div className="flex flex-col mt-4 w-full text-sm whitespace-nowrap">
//             <div className="flex overflow-hidden gap-2 p-1.5 mt-2 w-full bg-neutral-100 rounded-[100px] text-black text-opacity-60">
//               <input
//                 onChange={e => setminPrice(+e.target.value)}
//                 value={minPrice === 0 ? '' : minPrice}
//                 type="number"
//                 className="overflow-hidden p-3 bg-white rounded-[100px] outline-none w-full"
//               />
//               <input
//                 onChange={e => setmaxPrice(+e.target.value)}
//                 value={maxPrice === 0 ? '' : maxPrice}
//                 type="number"
//                 className="overflow-hidden p-3 bg-white rounded-[100px] outline-none w-full"
//               />
//             </div>
//           </div>

//           {/* Discount Checkbox */}
//           <div className="flex gap-3 items-center self-start mt-4 font-medium text-black text-opacity-80">
//             <div
//               onClick={() => setChecked(!checked)}
//               className={`flex shrink-0 self-stretch my-auto w-6 h-6 border border-solid border-black border-opacity-40 rounded-[100px] cursor-pointer transition-colors ${
//                 checked ? 'bg-[#3873C3]' : ''
//               }`}
//             />
//             <div className="self-stretch my-auto">
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default FilterOnlyCategories;
