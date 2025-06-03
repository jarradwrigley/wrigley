// "use client";

// import React, { Suspense, useEffect, useState } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import { useSpring, animated, config } from "@react-spring/web";
// import clsx from "clsx";
// import Image from "next/image";
// import { BadgeCheck, Cake, LayoutDashboard, PenLine, User } from "lucide-react";
// import { useSession } from "next-auth/react";
// import LoadingFallback from "../FallbackLoading";
// import Subscription from "../Subscription";

// // TypeScript Interfaces
// interface Employee {
//   id: number;
//   name: string;
//   position: string;
//   transactions: number;
//   rise: boolean;
//   tasksCompleted: number;
//   imgId: number;
// }

// interface Country {
//   name: string;
//   rise: boolean;
//   value: number;
//   id: number;
// }

// interface SegmentationItem {
//   c1: string;
//   c2: string;
//   c3: string;
//   color: string;
// }

// interface SidebarItem {
//   id: string;
//   title: string;
//   notifications: number | false;
// }

// interface GraphData {
//   name: string;
//   revenue: number;
//   expectedRevenue: number;
//   sales: number;
// }

// interface IconProps {
//   className?: string;
//   onClick?: () => void;
// }

// interface MenuItemProps {
//   item: SidebarItem;
//   onClick: (id: string) => void;
//   selected: string;
// }

// interface SidebarProps {
//   onSidebarHide: () => void;
//   showSidebar: boolean;
// }

// interface ContentProps {
//   onSidebarHide: () => void;
// }

// interface NameCardProps {
//   name: string;
//   position: string;
//   transactionAmount: number;
//   rise: boolean;
//   tasksCompleted: number;
//   imgId: number;
// }

// // Data
// // const employeeData: Employee[] = [
// //   {
// //     id: 1,
// //     name: "Esther Howard",
// //     position: "Sale's manager USA",
// //     transactions: 3490,
// //     rise: true,
// //     tasksCompleted: 3,
// //     imgId: 0,
// //   },
// //   {
// //     id: 2,
// //     name: "Eleanor Pena",
// //     position: "Sale's manager Europe",
// //     transactions: 590,
// //     rise: false,
// //     tasksCompleted: 5,
// //     imgId: 2,
// //   },
// //   {
// //     id: 3,
// //     name: "Robert Fox",
// //     position: "Sale's manager Asia",
// //     transactions: 2600,
// //     rise: true,
// //     tasksCompleted: 1,
// //     imgId: 3,
// //   },
// // ];

// // const countryData: Country[] = [
// //   { name: "USA", rise: true, value: 21942.83, id: 1 },
// //   { name: "Ireland", rise: false, value: 19710.0, id: 2 },
// //   { name: "Ukraine", rise: false, value: 12320.3, id: 3 },
// //   { name: "Sweden", rise: true, value: 9725.0, id: 4 },
// // ];

// // const segmentationData: SegmentationItem[] = [
// //   { c1: "Not Specified", c2: "800", c3: "#363636", color: "#535353" },
// //   { c1: "Male", c2: "441", c3: "#818bb1", color: "#595f77" },
// //   { c1: "Female", c2: "233", c3: "#2c365d", color: "#232942" },
// //   { c1: "Other", c2: "126", c3: "#334ed8", color: "#2c3051" },
// // ];

// // const sidebarItems: SidebarItem[][] = [
// //   [
// //     { id: "0", title: "Dashboard", notifications: false },
// //     { id: "1", title: "Overview", notifications: false },
// //     { id: "2", title: "Chat", notifications: 6 },
// //     { id: "3", title: "Team", notifications: false },
// //   ],
// //   [
// //     { id: "4", title: "Tasks", notifications: false },
// //     { id: "5", title: "Reports", notifications: false },
// //     { id: "6", title: "Settings", notifications: false },
// //   ],
// // ];

// // const graphData: GraphData[] = [
// //   "Nov",
// //   "Dec",
// //   "Jan",
// //   "Feb",
// //   "Mar",
// //   "Apr",
// //   "May",
// //   "June",
// //   "July",
// // ].map((month) => {
// //   const revenue = 500 + Math.random() * 2000;
// //   const expectedRevenue = Math.max(revenue + (Math.random() - 0.5) * 2000, 0);
// //   return {
// //     name: month,
// //     revenue,
// //     expectedRevenue,
// //     sales: Math.floor(Math.random() * 500),
// //   };
// // });

// function useProfile() {
//   const [profile, setProfile] = useState<any>({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const response = await fetch("/api/profile"); // You'll need to create this API route
//         const data = await response.json();
//         setProfile(data.profile);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProfile();
//   }, []);

//   // useEffect(() => {console.log('fff', profile)}, [profile])

//   return { profile, loading };
// }

// // Utility functions
// // const map = (
// //   value: number,
// //   sMin: number,
// //   sMax: number,
// //   dMin: number,
// //   dMax: number
// // ): number => {
// //   return dMin + ((value - sMin) / (sMax - sMin)) * (dMax - dMin);
// // };

// // const pi = Math.PI;
// // const tau = 2 * pi;

// // Icon Components
// // const DashboardIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M12 19C10.067 19 8.31704 18.2165 7.05029 16.9498L12 12V5C15.866 5 19 8.13401 19 12C19 15.866 15.866 19 12 19Z" />
// //     <path
// //       fillRule="evenodd"
// //       clipRule="evenodd"
// //       d="M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
// //     />
// //   </svg>
// // );

// // const OverviewIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path
// //       fillRule="evenodd"
// //       clipRule="evenodd"
// //       d="M3 5C3 3.34315 4.34315 2 6 2H14C17.866 2 21 5.13401 21 9V19C21 20.6569 19.6569 22 18 22H6C4.34315 22 3 20.6569 3 19V5ZM13 4H6C5.44772 4 5 4.44772 5 5V19C5 19.5523 5.44772 20 6 20H18C18.5523 20 19 19.5523 19 19V9H13V4ZM18.584 7C17.9413 5.52906 16.6113 4.4271 15 4.10002V7H18.584Z"
// //     />
// //   </svg>
// // );

// // const ChatIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M2 4V18L6.8 14.4C7.14582 14.1396 7.56713 13.9992 8 14H16C17.1046 14 18 13.1046 18 12V4C18 2.89543 17.1046 2 16 2H4C2.89543 2 2 2.89543 2 4ZM4 14V4H16V12H7.334C6.90107 11.9988 6.47964 12.1393 6.134 12.4L4 14Z" />
// //     <path d="M22 22V9C22 7.89543 21.1046 7 20 7V18L17.866 16.4C17.5204 16.1393 17.0989 15.9988 16.666 16H7C7 17.1046 7.89543 18 9 18H16C16.4329 17.9992 16.8542 18.1396 17.2 18.4L22 22Z" />
// //   </svg>
// // );

// // const TeamIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M9 3C6.23858 3 4 5.23858 4 8C4 10.7614 6.23858 13 9 13C11.7614 13 14 10.7614 14 8C14 5.23858 11.7614 3 9 3ZM6 8C6 6.34315 7.34315 5 9 5C10.6569 5 12 6.34315 12 8C12 9.65685 10.6569 11 9 11C7.34315 11 6 9.65685 6 8Z" />
// //     <path d="M16 21H14C14 18.2386 11.7614 16 9 16C6.23858 16 4 18.2386 4 21H2C2 17.134 5.13401 14 9 14C12.866 14 16 17.134 16 21Z" />
// //   </svg>
// // );

// // const TasksIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M19 22H5C3.89543 22 3 21.1046 3 20V6C3 4.89543 3.89543 4 5 4H7V2H9V4H15V2H17V4H19C20.1046 4 21 4.89543 21 6V20C21 21.1046 20.1046 22 19 22ZM5 10V20H19V10H5ZM5 6V8H19V6H5ZM17 14H7V12H17V14Z" />
// //   </svg>
// // );

// // const ReportsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M21.266 20.998H2.73301C2.37575 20.998 2.04563 20.8074 1.867 20.498C1.68837 20.1886 1.68838 19.8074 1.86701 19.498L11.133 3.49799C11.3118 3.1891 11.6416 2.9989 11.9985 2.9989C12.3554 2.9989 12.6852 3.1891 12.864 3.49799L22.13 19.498C22.3085 19.8072 22.3086 20.1882 22.1303 20.4975C21.9519 20.8069 21.6221 20.9976 21.265 20.998H21.266ZM12 5.99799L4.46901 18.998H19.533L12 5.99799ZM12.995 14.999H10.995V9.99799H12.995V14.999Z" />
// //     <path d="M11 16H13V18H11V16Z" />
// //   </svg>
// // );

// // const SettingsIcon: React.FC<IconProps> = ({ className = "w-5 h-5" }) => (
// //   <svg className={className} viewBox="0 0 24 24" fill="currentColor">
// //     <path d="M13.82 22H10.18C9.71016 22 9.3036 21.673 9.20304 21.214L8.79604 19.33C8.25309 19.0921 7.73827 18.7946 7.26104 18.443L5.42404 19.028C4.97604 19.1709 4.48903 18.9823 4.25404 18.575L2.43004 15.424C2.19763 15.0165 2.2777 14.5025 2.62304 14.185L4.04804 12.885C3.98324 12.2961 3.98324 11.7019 4.04804 11.113L2.62304 9.816C2.27719 9.49837 2.19709 8.98372 2.43004 8.576L4.25004 5.423C4.48503 5.0157 4.97204 4.82714 5.42004 4.97L7.25704 5.555C7.5011 5.37416 7.75517 5.20722 8.01804 5.055C8.27038 4.91269 8.53008 4.78385 8.79604 4.669L9.20404 2.787C9.30411 2.32797 9.71023 2.00049 10.18 2H13.82C14.2899 2.00049 14.696 2.32797 14.796 2.787L15.208 4.67C15.4888 4.79352 15.7623 4.93308 16.027 5.088C16.274 5.23081 16.5127 5.38739 16.742 5.557L18.58 4.972C19.0277 4.82967 19.5142 5.01816 19.749 5.425L21.569 8.578C21.8015 8.98548 21.7214 9.49951 21.376 9.817L19.951 11.117C20.0158 11.7059 20.0158 12.3001 19.951 12.889L21.376 14.189C21.7214 14.5065 21.8015 15.0205 21.569 15.428L19.749 18.581C19.5142 18.9878 19.0277 19.1763 18.58 19.034L16.742 18.449C16.5095 18.6203 16.2678 18.7789 16.018 18.924C15.7559 19.0759 15.4854 19.2131 15.208 19.335L14.796 21.214C14.6956 21.6726 14.2895 21.9996 13.82 22ZM11.996 16C9.7869 16 7.99604 14.2091 7.99604 12C7.99604 9.79086 9.7869 8 11.996 8C14.2052 8 15.996 9.79086 15.996 12C15.9933 14.208 14.204 15.9972 11.996 16ZM11.996 10C10.9034 10.0011 10.0139 10.8788 9.99827 11.9713C9.98262 13.0638 10.8466 13.9667 11.9387 13.9991C13.0309 14.0315 13.9469 13.1815 13.996 12.09V12C13.996 10.8954 13.1006 10 11.996 10Z" />
// //   </svg>
// // );

// // const SidebarIcons: React.FC<{ id: string }> = ({ id }) => {
// //   const iconMap: Record<string, React.FC<IconProps>> = {
// //     "0": DashboardIcon,
// //     "1": OverviewIcon,
// //     "2": ChatIcon,
// //     "3": TeamIcon,
// //     "4": TasksIcon,
// //     "5": ReportsIcon,
// //     "6": SettingsIcon,
// //   };

// //   const IconComponent = iconMap[id] || DashboardIcon;
// //   return <IconComponent className="w-8 h-8 xl:w-5 xl:h-5" />;
// // };

// // Profile Avatar Component
// // const ProfileAvatar: React.FC<{ className?: string }> = ({
// //   className = "w-10 h-10",
// // }) => (
// //   <div
// //     className={clsx(
// //       className,
// //       "rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold"
// //     )}
// //   >
// //     JW
// //   </div>
// // );

// // // Mock Icon Component for other icons
// // const MockIcon: React.FC<{ className?: string }> = ({
// //   className = "w-4 h-4",
// // }) => <div className={clsx(className, "bg-gray-600 rounded")} />;

// // // Components
// // const MenuItem: React.FC<MenuItemProps> = ({
// //   item: { id, title, notifications },
// //   onClick,
// //   selected,
// // }) => {
// //   return (
// //     <div
// //       className={clsx(
// //         "w-full mt-6 flex items-center px-3 sm:px-0 xl:px-3 justify-start sm:justify-center xl:justify-start sm:mt-6 xl:mt-3 cursor-pointer",
// //         selected === id
// //           ? "text-white border-r-2 border-white"
// //           : "border-r-2 border-transparent hover:text-gray-300"
// //       )}
// //       onClick={() => onClick(id)}
// //     >
// //       <SidebarIcons id={id} />
// //       <div className="block sm:hidden xl:block ml-2">{title}</div>
// //       <div className="block sm:hidden xl:block flex-grow" />
// //       {notifications && (
// //         <div className="flex sm:hidden xl:flex bg-pink-600 w-5 h-5 flex items-center justify-center rounded-full mr-2">
// //           <div className="text-white text-sm">{notifications}</div>
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // const SidebarMenuItem: React.FC<MenuItemProps> = ({
// //   item: { id, title, notifications },
// //   onClick,
// //   selected,
// // }) => {
// //   return (
// //     <div
// //       className={clsx(
// //         "w-full mt-6 flex items-center px-3 sm:px-0 xl:px-3 justify-start sm:justify-center xl:justify-start sm:mt-6 xl:mt-3 cursor-pointer",
// //         selected === id
// //           ? "text-white border-r-2 border-white"
// //           : "border-r-2 border-transparent hover:text-gray-300"
// //       )}
// //       onClick={() => onClick(id)}
// //     >
// //       <LayoutDashboard />
// //       {/* <SidebarIcons id={id} />
// //       <div className="block sm:hidden xl:block ml-2">{title}</div>
// //       <div className="block sm:hidden xl:block flex-grow" />
// //       {notifications && (
// //         <div className="flex sm:hidden xl:flex bg-pink-600 w-5 h-5 flex items-center justify-center rounded-full mr-2">
// //           <div className="text-white text-sm">{notifications}</div>
// //         </div>
// //       )} */}
// //     </div>
// //   );
// // };

// // const Sidebar: React.FC<SidebarProps> = ({ onSidebarHide, showSidebar }) => {
// //   const [selected, setSelected] = useState("0");
// //   const { dashOffset, indicatorWidth, percentage } = useSpring({
// //     dashOffset: 26.015,
// //     indicatorWidth: 70,
// //     percentage: 77,
// //     from: { dashOffset: 113.113, indicatorWidth: 0, percentage: 0 },
// //     config: config.molasses,
// //   });

// //   const { data: session } = useSession();

// //   return (
// //     <div
// //       className={clsx(
// //         "fixed inset-y-0 left-0 bg-transparent pl-1 w-full justify-center sm:w-20 xl:w-60 no-scrollbar sm:flex flex-col z-10",
// //         showSidebar ? "flex" : "hidden"
// //       )}
      
// //     >
// //       <div className="h-fit shadow-lg backdrop-blur-md bg-white/40 border border-white/20 py-5 rounded-full">
// //         <div className="flex-shrink-0 overflow-hidden  p-2 ">
// //           <div className="flex items-center h-full sm:justify-center no-scrollbar xl:justify-start p-2 border-b border-neutral-700">
// //             {/* <MockIcon className="w-10 h-10" /> */}
// //             <Image
// //               src="/images/logo_red.avif"
// //               alt="logo"
// //               width={40}
// //               height={40}
// //             />
// //             <div className="block sm:hidden xl:block ml-2 font-bold text-xl text-white">
// //               React
// //             </div>
// //             <div className="flex-grow sm:hidden xl:block" />
// //             <button className="block sm:hidden" onClick={onSidebarHide}>
// //               <MockIcon />
// //             </button>
// //           </div>
// //         </div>

// //         <div className=" no-scrollbar h-fit  flex flex-col">
// //           {sidebarItems[0].map((item) => (
// //             <SidebarMenuItem
// //               key={item.id}
// //               item={item}
// //               onClick={setSelected}
// //               selected={selected}
// //             />
// //             //   <LayoutDashboard key={item.id} />
// //           ))}

// //           <div className="mt-8 mb-0 font-bold px-3 block sm:hidden xl:block text-gray-400">
// //             SHORTCUTS
// //           </div>

// //           {sidebarItems[1].map((item) => (
// //             <MenuItem
// //               key={item.id}
// //               item={item}
// //               onClick={setSelected}
// //               selected={selected}
// //             />
// //           ))}

// //           <div className="flex-grow" />

// //           {/* <div className="w-full p-3 h-28 hidden sm:block sm:h-20 xl:h-32">
// //           <div className="rounded-xl flex items-center justify-center w-full h-full px-3 sm:px-0 xl:px-3 overflow-hidden bg-gradient-to-br from-purple-600 to-blue-600">
// //             <Image
// //               src={session?.user?.profilePic ?? "/images/product1.avif"}
// //               className="rounded-full"
// //               alt="profpic"
// //               width={50}
// //               height={50}
// //             />
// //           </div>
// //         </div> */}
// //         </div>
// //       </div>

// //       {/* <div className="flex-shrink-0 overflow-hidden p-2">
// //         <div className="flex items-center h-full sm:justify-center xl:justify-start p-2 border-t border-neutral-700">
// //           <ProfileAvatar className="w-10 h-10" />
// //           <div className="block sm:hidden xl:block ml-2 font-bold text-white">
// //             Jerry Wilson
// //           </div>
// //           <div className="flex-grow block sm:hidden xl:block" />
// //           <MockIcon className="block sm:hidden xl:block w-3 h-3" />
// //         </div>
// //       </div> */}
// //     </div>
// //   );
// // };

// // const NameCard: React.FC<NameCardProps> = ({
// //   name,
// //   position,
// //   transactionAmount,
// //   rise,
// //   tasksCompleted,
// //   imgId,
// // }) => {
// //   const { transactions, barPlayhead } = useSpring({
// //     transactions: transactionAmount,
// //     barPlayhead: 1,
// //     from: { transactions: 0, barPlayhead: 0 },
// //   });

// //   return (
// //     <div className="w-full flex flex-col gap-4 justify-between p-2 lg:w-1/3">
// //       <div className="rounded-lg bg-neutral-900 flex justify-between p-3 h-1/2">
// //         <div>
// //           <div className="flex items-center">
// //             <ProfileAvatar className="w-10 h-10" />
// //             <div className="ml-2">
// //               <div className="flex items-center">
// //                 <div className="mr-2 font-bold text-white">{name}</div>
// //                 <MockIcon />
// //               </div>
// //               <div className="text-sm text-gray-400">{position}</div>
// //             </div>
// //           </div>

// //           <div className="text-sm text-gray-400 mt-2">{`${tasksCompleted} from 5 tasks completed`}</div>
// //           <svg className="w-44 mt-3" height="6" viewBox="0 0 200 6" fill="none">
// //             <rect width="200" height="6" rx="3" fill="#2D2D2D" />
// //             <animated.rect
// //               width={barPlayhead.to((i) => i * (tasksCompleted / 5) * 200)}
// //               height="6"
// //               rx="3"
// //               fill="url(#paint0_linear)"
// //             />
// //             <rect x="38" width="2" height="6" fill="#171717" />
// //             <rect x="78" width="2" height="6" fill="#171717" />
// //             <rect x="118" width="2" height="6" fill="#171717" />
// //             <rect x="158" width="2" height="6" fill="#171717" />
// //             <defs>
// //               <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="0">
// //                 <stop stopColor="#8E76EF" />
// //                 <stop offset="1" stopColor="#3912D2" />
// //               </linearGradient>
// //             </defs>
// //           </svg>
// //         </div>
// //         <div className="flex flex-col items-center">
// //           <MockIcon className="w-8 h-8" />
// //           <animated.div
// //             className={clsx(
// //               rise ? "text-green-500" : "text-red-500",
// //               "font-bold text-lg"
// //             )}
// //           >
// //             {transactions.to((i) => `$${i.toFixed(2)}`)}
// //           </animated.div>
// //           <div className="text-sm text-gray-400">Last 6 month</div>
// //         </div>
// //       </div>
// //       {/* <div className="rounded-lg bg-neutral-900 flex justify-between p-3 h-1/2">
// //         <div>
// //           <div className="flex items-center">
// //             <ProfileAvatar className="w-10 h-10" />
// //             <div className="ml-2">
// //               <div className="flex items-center">
// //                 <div className="mr-2 font-bold text-white">{name}</div>
// //                 <MockIcon />
// //               </div>
// //               <div className="text-sm text-gray-400">{position}</div>
// //             </div>
// //           </div>

// //           <div className="text-sm text-gray-400 mt-2">{`${tasksCompleted} from 5 tasks completed`}</div>
// //           <svg className="w-44 mt-3" height="6" viewBox="0 0 200 6" fill="none">
// //             <rect width="200" height="6" rx="3" fill="#2D2D2D" />
// //             <animated.rect
// //               width={barPlayhead.to((i) => i * (tasksCompleted / 5) * 200)}
// //               height="6"
// //               rx="3"
// //               fill="url(#paint0_linear)"
// //             />
// //             <rect x="38" width="2" height="6" fill="#171717" />
// //             <rect x="78" width="2" height="6" fill="#171717" />
// //             <rect x="118" width="2" height="6" fill="#171717" />
// //             <rect x="158" width="2" height="6" fill="#171717" />
// //             <defs>
// //               <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="0">
// //                 <stop stopColor="#8E76EF" />
// //                 <stop offset="1" stopColor="#3912D2" />
// //               </linearGradient>
// //             </defs>
// //           </svg>
// //         </div>
// //         <div className="flex flex-col items-center">
// //           <MockIcon className="w-8 h-8" />
// //           <animated.div
// //             className={clsx(
// //               rise ? "text-green-500" : "text-red-500",
// //               "font-bold text-lg"
// //             )}
// //           >
// //             {transactions.to((i) => `$${i.toFixed(2)}`)}
// //           </animated.div>
// //           <div className="text-sm text-gray-400">Last 6 month</div>
// //         </div>
// //       </div> */}
// //     </div>
// //   );
// // };

// // const Graph: React.FC = () => {
// //   const CustomTooltip = () => (
// //     <div className="rounded-xl overflow-hidden bg-neutral-800">
// //       <div className="flex items-center justify-between p-2">
// //         <div className="text-gray-300">Revenue</div>
// //         <MockIcon className="w-2 h-2" />
// //       </div>
// //       <div className="bg-neutral-700 text-center p-3">
// //         <div className="text-white font-bold">$1300.50</div>
// //         <div className="text-gray-400">Revenue from 230 sales</div>
// //       </div>
// //     </div>
// //   );

// //   return (
// //     <div className="flex p-4 h-full flex-col">
// //       <div>
// //         <div className="flex items-center">
// //           <div className="font-bold text-white">Your Work Summary</div>
// //           <div className="flex-grow" />
// //           <MockIcon className="w-4 h-4" />
// //           <div className="ml-2 text-gray-400">Last 9 Months</div>
// //           <div className="ml-6 w-5 h-5 flex justify-center items-center rounded-full bg-neutral-700 text-gray-400">
// //             ?
// //           </div>
// //         </div>
// //         <div className="font-bold ml-5 text-gray-400">Nov - July</div>
// //       </div>

// //       <div className="flex-grow">
// //         <ResponsiveContainer width="100%" height="100%">
// //           <LineChart width={500} height={300} data={graphData}>
// //             <defs>
// //               <linearGradient
// //                 id="paint0_linear_graph"
// //                 x1="0"
// //                 y1="0"
// //                 x2="1"
// //                 y2="0"
// //               >
// //                 <stop stopColor="#6B8DE3" />
// //                 <stop offset="1" stopColor="#7D1C8D" />
// //               </linearGradient>
// //             </defs>
// //             <CartesianGrid
// //               horizontal={false}
// //               strokeWidth="6"
// //               stroke="#252525"
// //             />
// //             <XAxis
// //               dataKey="name"
// //               axisLine={false}
// //               tickLine={false}
// //               tickMargin={10}
// //             />
// //             <YAxis axisLine={false} tickLine={false} tickMargin={10} />
// //             <Tooltip content={<CustomTooltip />} cursor={false} />
// //             <Line
// //               activeDot={false}
// //               type="monotone"
// //               dataKey="expectedRevenue"
// //               stroke="#242424"
// //               strokeWidth="3"
// //               dot={false}
// //               strokeDasharray="8 8"
// //             />
// //             <Line
// //               type="monotone"
// //               dataKey="revenue"
// //               stroke="url(#paint0_linear_graph)"
// //               strokeWidth="4"
// //               dot={false}
// //             />
// //           </LineChart>
// //         </ResponsiveContainer>
// //       </div>
// //     </div>
// //   );
// // };

// // const TopCountries: React.FC = () => {
// //   return (
// //     <div className="flex p-4 flex-col h-full">
// //       <div className="flex justify-between items-center">
// //         <div className="text-white font-bold">Top Countries</div>
// //         <MockIcon className="w-5 h-5" />
// //       </div>
// //       <div className="text-gray-400">favourites</div>
// //       {countryData.map(({ name, rise, value, id }) => (
// //         <div className="flex items-center mt-3" key={id}>
// //           <div className="text-gray-400">{id}</div>
// //           <MockIcon className="ml-2 w-6 h-6" />
// //           <div className="ml-2 text-gray-300">{name}</div>
// //           <div className="flex-grow" />
// //           <div className="text-gray-300">{`$${value.toLocaleString()}`}</div>
// //           <MockIcon className="w-4 h-4 mx-3" />
// //           <MockIcon className="w-2 h-2" />
// //         </div>
// //       ))}
// //       <div className="flex-grow" />
// //       <div className="flex justify-center">
// //         <div className="text-gray-400">Check All</div>
// //       </div>
// //     </div>
// //   );
// // };

// // const Segmentation: React.FC = () => {
// //   return (
// //     <div className="p-4 h-full">
// //       <div className="flex justify-between items-center">
// //         <div className="text-white font-bold">Segmentation</div>
// //         <MockIcon className="w-2 h-2" />
// //       </div>
// //       <div className="mt-3 text-gray-400">All users</div>
// //       {segmentationData.map(({ c1, c2, color }) => (
// //         <div className="flex items-center mt-2" key={c1}>
// //           <div className="w-2 h-2 rounded-full" style={{ background: color }} />
// //           <div className="ml-2" style={{ color }}>
// //             {c1}
// //           </div>
// //           <div className="flex-grow" />
// //           <div style={{ color }}>{c2}</div>
// //           <div className="ml-2 w-12 border-b-2 border-gray-600" />
// //           <div className="ml-2 h-8">
// //             <div
// //               className="w-20 h-28 rounded-lg overflow-hidden"
// //               style={{ background: color }}
// //             />
// //           </div>
// //         </div>
// //       ))}

// //       <div className="flex mt-3 px-3 items-center justify-between bg-neutral-800 rounded-xl w-36 h-12">
// //         <div className="text-gray-300">Details</div>
// //         <MockIcon className="w-4 h-4" />
// //       </div>
// //     </div>
// //   );
// // };

// // const Satisfaction: React.FC = () => {
// //   const { dashOffset } = useSpring({
// //     dashOffset: 78.54,
// //     from: { dashOffset: 785.4 },
// //     config: config.molasses,
// //   });

// //   return (
// //     <div className="p-4 h-full">
// //       <div className="flex justify-between items-center">
// //         <div className="text-white font-bold">Subscription</div>
// //         {/* <MockIcon className="w-2 h-2" /> */}
// //       </div>
// //       {/* <div className="mt-3 text-gray-400">Mobile Only v4</div> */}
// //       <div className="flex justify-center">
// //         <svg viewBox="0 0 700 380" fill="none" width="300">
// //           <path
// //             d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
// //             stroke="#2d2d2d"
// //             strokeWidth="40"
// //             strokeLinecap="round"
// //           />
// //           <animated.path
// //             d="M100 350C100 283.696 126.339 220.107 173.223 173.223C220.107 126.339 283.696 100 350 100C416.304 100 479.893 126.339 526.777 173.223C573.661 220.107 600 283.696 600 350"
// //             stroke="#2f49d0"
// //             strokeWidth="40"
// //             strokeLinecap="round"
// //             strokeDasharray="785.4"
// //             strokeDashoffset={dashOffset}
// //           />
// //           <animated.circle
// //             cx={dashOffset.to(
// //               (x) => 350 + 250 * Math.cos(map(x, 785.4, 0, pi, tau))
// //             )}
// //             cy={dashOffset.to(
// //               (x) => 350 + 250 * Math.sin(map(x, 785.4, 0, pi, tau))
// //             )}
// //             r="12"
// //             fill="#fff"
// //           />
// //           {/* Satisfaction emoji in center */}
// //           <circle cx="347" cy="290" r="80" fill="#FFE17D" />
// //           <circle cx="330" cy="275" r="3" fill="#7D5046" />
// //           <circle cx="365" cy="275" r="3" fill="#7D5046" />
// //           <path
// //             d="M330 310 Q347 325 365 310"
// //             stroke="#AA7346"
// //             strokeWidth="3"
// //             fill="none"
// //           />
// //         </svg>
// //       </div>

// //       <div className="flex justify-center">
// //         <div className="flex justify-between mt-2" style={{ width: "300px" }}>
// //           <div
// //             className="text-gray-400"
// //             style={{ width: "50px", paddingLeft: "16px" }}
// //           >
// //             0%
// //           </div>
// //           <div className="text-center" style={{ width: "150px" }}>
// //             <div className="font-bold text-blue-500 text-lg">97.78%</div>
// //             <div className="text-gray-400">Mobile Only v4</div>
// //           </div>
// //           <div className="text-gray-400" style={{ width: "50px" }}>
// //             100%
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // const AddComponent: React.FC = () => {
// //   return (
// //     <div>
// //       <div className="w-full h-20 bg-gradient-to-r from-neutral-800 to-neutral-700" />
// //       <div
// //         className="flex flex-col items-center"
// //         style={{ transform: "translate(0, -40px)" }}
// //       >
// //         <div className="bg-neutral-600 w-20 h-20 rounded-full flex items-center justify-center">
// //           🚀
// //         </div>
// //         <div className="text-white font-bold mt-3">
// //           No Components Created Yet
// //         </div>
// //         <div className="mt-2 text-gray-400">
// //           Simply create your first component
// //         </div>
// //         <div className="mt-1 text-gray-400">Just click on the button</div>
// //         <div className="flex items-center p-3 mt-3 bg-blue-600 rounded-2xl text-white">
// //           <MockIcon className="w-5 h-5" />
// //           <div className="ml-2">Add Component</div>
// //           <div className="ml-2 bg-blue-500 rounded-2xl px-2 py-1">129</div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// const Content: React.FC<ContentProps> = ({ onSidebarHide }) => {
//   const { data: session } = useSession();
//   const { profile, loading } = useProfile();

//   return (
//     <div className="flex w-full">
//       <div className="w-full dis-none h-full hidden sm:block sm:w-20 xl:w-60 flex-shrink-0" />
//       <div className="h-full flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
//         {/* <div className="w-full sm:flex p-2 items-end">
//           <div className="sm:flex-grow flex justify-between">
//             <div>
//               <div className="flex items-center">
//                 <div className="text-3xl font-bold text-white">Hello David</div>
//                 <div className="flex items-center p-2 bg-neutral-900 ml-2 rounded-xl">
//                   <MockIcon />
//                   <div className="ml-2 font-bold text-yellow-400">PREMIUM</div>
//                 </div>
//               </div>
//               <div className="flex items-center">
//                 <MockIcon className="w-3 h-3" />
//                 <div className="ml-2 text-gray-400">October 26</div>
//               </div>
//             </div>
//             <button className="block sm:hidden" onClick={onSidebarHide}>
//               <MockIcon />
//             </button>
//           </div>
//           <div className="w-full sm:w-56 mt-4 sm:mt-0 relative">
//             <MockIcon className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2" />
//             <input
//               type="text"
//               className="pl-12 py-2 pr-2 block w-full rounded-lg border-gray-300 bg-neutral-900 text-gray-300 placeholder-gray-500"
//               placeholder="search"
//             />
//           </div>
//         </div> */}

//         <div className="w-full p-2 lg:w-2/3 h-80 relative rounded-lg">
//           {/* <div className="rounded-lg bg-neutral-900 sm:h-80 h-60">
//             <Graph />
//           </div> */}
//           {/* <div>Width</div> */}
//           <img
//             src="/images/bgClock.png"
//             alt="profile"
//             className="w-full h-full object-cover rounded-lg"
//           />

//           <div className="absolute bottom-[10%] p-1 bg-white/70 rounded-full left-[5%]">
//             {/* <img
//               src={profile.profilePic ?? "/images/product1.avif"}
//               alt="profile"
//               className="w-[8rem] h-[8rem] object-cover rounded-full"
//             /> */}
//             {profile?.profilePic ? (
//               <Image
//                 src={profile?.profilePic ?? "/images/product1.avif"}
//                 className="rounded-full"
//                 alt="profpic"
//                 width={100}
//                 height={100}
//               />
//             ) : (
//               <div className="w-[7rem] h-[7rem] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
//                 {profile?.fullName?.[0] ?? "U"}
//               </div>
//             )}
//           </div>
//         </div>
//         {/* CHECK BEFORE YOU DELETE */}
//         {/* <div className="w-full p-2 lg:w-2/3">
//           <div className="rounded-lg bg-neutral-900 sm:h-80 h-60">
//             <Graph />
//           </div>
//         </div> */}
//         <div className="w-full h-fit  p-3 lg:w-1/3">
//           <div className="h-fit p-3 shadow-lg backdrop-blur-md bg-white/40 border relative border-white/20 rounded-lg ">
//             <div className="flex items-center gap-3">
//               <span className="text-xl font-medium">
//                 {profile?.fullName ?? ""}
//               </span>
//               <BadgeCheck size={16} fill="#1dcaff" />
//             </div>
//             <div className="flex items-center gap-2  ">
//               <h2 className="font-bold text-xs">
//                 {profile?.followers?.length ?? "0"}
//                 <span className="font-light">
//                   {" "}
//                   {profile?.followers?.length === 1 ? "follower" : "followers"}
//                 </span>
//               </h2>
//               <span>•</span>
//               <h2 className="font-bold text-xs">
//                 {profile?.following?.length ?? "0"}
//                 <span className="font-light"> following</span>
//               </h2>
//             </div>

//             <span className="text-xs font-extralight">
//               {/* Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean
//               viverra sollicitudin lectus. Fusce a mi vel nulla tincidunt
//               fringilla eu et lectus. Aenean cursus, velit a efficitur
//               sollicitudin, velit quam faucibus nibh, in fermentum neque sem
//               bibendum purus. */}
//               {profile?.bio ?? "Share something about yourself..."}
//               {/* Share something about yourself... */}
//             </span>
//             <div className="w-full h-[.2px] bg-black my-2" />
//             {/* <span>Basic Info</span> */}

//             {profile?.gender || profile?.dob ? (
//               <>
//                 {profile.gender && (
//                   <div className="flex py-3 items-center gap-3">
//                     <div className="p-2 bg-black/50 shadow-lg backdrop-blur-md rounded-full w-[2.5rem] h-[2.5rem] flex items-center justify-center">
//                       <User />
//                     </div>

//                     <div className="flex flex-col">
//                       <span className="text-[14px] font-bold">Female</span>
//                       <span className="text-xs font-light">Gender</span>
//                     </div>
//                   </div>
//                 )}

//                 {profile.dob && (
//                   <div className="flex py-3 items-center gap-3">
//                     <div className="p-2 bg-black/50 shadow-lg backdrop-blur-md rounded-full w-[2.5rem] h-[2.5rem] flex items-center justify-center">
//                       <Cake />
//                     </div>

//                     <div className="flex flex-col">
//                       <span className="text-[14px] font-bold">
//                         September 12, 1997
//                       </span>
//                       <span className="text-xs font-light">Birthday</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="w-full flex justify-center">
//                   <button className="flex items-center gap-4 hover:bg-white/80 hover:text-black rounded-lg px-3 py-2">
//                     <PenLine />
//                     <span>Edit Profile</span>
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="w-full flex justify-center">
//                 <button className="flex items-center gap-4 hover:bg-white/80 hover:text-black rounded-lg px-3 py-2">
//                   <PenLine />
//                   <span>Edit Profile</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* {employeeData.map(
//           ({
//             id,
//             name,
//             position,
//             transactions,
//             rise,
//             tasksCompleted,
//             imgId,
//           }) => (
//             <NameCard
//               key={id}
//               name={name}
//               position={position}
//               transactionAmount={transactions}
//               rise={rise}
//               tasksCompleted={tasksCompleted}
//               imgId={imgId}
//             />
//           )
//         )} */}

//         {/* <NameCard
//           //   key={id}
//           name={"String"}
//           position={"String"}
//           transactionAmount={3490}
//           rise={true}
//           tasksCompleted={3}
//           imgId={0}
//         /> */}

//         <div className="w-full p-2 lg:w-2/3 ">
//           <div className="rounded-lg bg-neutral-900 p-4">
//             {/* <Segmentation /> */}
//             <span className="text-2xl" style={{ fontFamily: "Cabin" }}>
//               Posts
//             </span>

//             <div className="my-4 h-[.01rem] w-full bg-white/50" />

//             <div>
//               <div className="flex flex-col gap-4 items-center w-full py-[10rem]">
//                 <span className="text-gray-500">
//                   Your Blog Posts and Interactions will appear here
//                 </span>
//                 {/* <button className="py-3 px-6 shadow-lg backdrop-blur-md bg-white/40 hover:bg-white/80 border relative border-white/20 rounded-lg hover:text-black">
//                   <span>Say Something</span>
//                 </button> */}
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="w-full p-2 lg:w-1/3 flex flex-col gap-4">
//           <span className="text-2xl" style={{ fontFamily: "Cabin" }}>
//             Subscriptions
//           </span>
//           <div className="w-full p-2 max-h-[35rem] overflow-y-auto no-scrollbar flex flex-col gap-3">
//             <div className="rounded-lg bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//             <div className="rounded-lg  bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//             <div className="rounded-lg  bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//           </div>
//         </div>

//         {/* <div className="w-full p-2 lg:w-1/3">
//           <div className="rounded-lg bg-neutral-900 h-80">
//             <Segmentation />
//           </div>
//         </div> */}

//         {/* <div className="w-full p-2 lg:w-1/3">
//           <div className="rounded-lg bg-neutral-900 h-80">
            
//             <Subscription title={"Mobile Only v4"} percentage={28.0} />
//           </div>
//         </div> */}
//         {/* <div className="w-full p-2 lg:w-1/3">
//           <div className="rounded-lg bg-neutral-900 overflow-hidden h-80">
//             <AddComponent />
//           </div>
//         </div> */}
//       </div>
//     </div>
//   );
// };

// const DesktopProfilePage: React.FC = () => {
//   const { profile, loading } = useProfile();

//   const [showSidebar, setShowSidebar] = useState(false);

//   if (loading) {
//     return <LoadingFallback />;
//   }

//   return (
//     <>
//       {/* <div className="flex bg-neutral-800 text-gray-300 h-max font-sans"> */}
//       <Suspense fallback={<LoadingFallback />}>
//         {/* <Sidebar
//           onSidebarHide={() => setShowSidebar(false)}
//           showSidebar={showSidebar}
//         /> */}
//         <Content onSidebarHide={() => setShowSidebar(true)} />
//         {/* </div> */}
//         {/* <OrderConfirmationContent /> */}
//       </Suspense>
//     </>
//   );
// };

// export default DesktopProfilePage;



// "use client";

// import React, { Suspense, useEffect, useState } from "react";
// import Image from "next/image";
// import { BadgeCheck, Cake, PenLine, User } from "lucide-react";
// import { useSession } from "next-auth/react";
// import LoadingFallback from "../FallbackLoading";
// import Subscription from "../Subscription";

// function useProfile() {
//   const [profile, setProfile] = useState<any>({});
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function fetchProfile() {
//       try {
//         const response = await fetch("/api/profile"); // You'll need to create this API route
//         const data = await response.json();
//         setProfile(data.profile);
//       } catch (error) {
//         console.error("Error fetching profile:", error);
//       } finally {
//         setLoading(false);
//       }
//     }

//     fetchProfile();
//   }, []);

//   // useEffect(() => {console.log('fff', profile)}, [profile])

//   return { profile, loading };
// }

// const Content: React.FC = () => {
//   const { data: session } = useSession();
//   const { profile, loading } = useProfile();

//   return (
//     <div className="flex w-full">
//       <div className="w-full dis-none h-full hidden sm:block sm:w-20 xl:w-60 flex-shrink-0" />
//       <div className="h-full flex-grow overflow-x-hidden overflow-auto flex flex-wrap content-start p-2">
//         <div className="w-full p-2 lg:w-2/3 h-80 relative rounded-lg">
//           <img
//             src="/images/bgClock.png"
//             alt="profile"
//             className="w-full h-full object-cover rounded-lg"
//           />

//           <div className="absolute bottom-[10%] p-1 bg-white/70 rounded-full left-[5%]">
//             {profile?.profilePic ? (
//               <Image
//                 src={profile?.profilePic ?? "/images/product1.avif"}
//                 className="rounded-full"
//                 alt="profpic"
//                 width={100}
//                 height={100}
//               />
//             ) : (
//               <div className="w-[7rem] h-[7rem] bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-2xl">
//                 {profile?.fullName?.[0] ?? "U"}
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="w-full h-fit  p-3 lg:w-1/3">
//           <div className="h-fit p-3 shadow-lg backdrop-blur-md bg-white/40 border relative border-white/20 rounded-lg ">
//             <div className="flex items-center gap-3">
//               <span className="text-xl font-medium">
//                 {profile?.fullName ?? ""}
//               </span>
//               <BadgeCheck size={16} fill="#1dcaff" />
//             </div>
//             <div className="flex items-center gap-2  ">
//               <h2 className="font-bold text-xs">
//                 {profile?.followers?.length ?? "0"}
//                 <span className="font-light">
//                   {" "}
//                   {profile?.followers?.length === 1 ? "follower" : "followers"}
//                 </span>
//               </h2>
//               <span>•</span>
//               <h2 className="font-bold text-xs">
//                 {profile?.following?.length ?? "0"}
//                 <span className="font-light"> following</span>
//               </h2>
//             </div>

//             <span className="text-xs font-extralight">
//               {profile?.bio ?? "Share something about yourself..."}
//             </span>
//             <div className="w-full h-[.2px] bg-black my-2" />

//             {profile?.gender || profile?.dob ? (
//               <>
//                 {profile.gender && (
//                   <div className="flex py-3 items-center gap-3">
//                     <div className="p-2 bg-black/50 shadow-lg backdrop-blur-md rounded-full w-[2.5rem] h-[2.5rem] flex items-center justify-center">
//                       <User />
//                     </div>

//                     <div className="flex flex-col">
//                       <span className="text-[14px] font-bold">Female</span>
//                       <span className="text-xs font-light">Gender</span>
//                     </div>
//                   </div>
//                 )}

//                 {profile.dob && (
//                   <div className="flex py-3 items-center gap-3">
//                     <div className="p-2 bg-black/50 shadow-lg backdrop-blur-md rounded-full w-[2.5rem] h-[2.5rem] flex items-center justify-center">
//                       <Cake />
//                     </div>

//                     <div className="flex flex-col">
//                       <span className="text-[14px] font-bold">
//                         September 12, 1997
//                       </span>
//                       <span className="text-xs font-light">Birthday</span>
//                     </div>
//                   </div>
//                 )}

//                 <div className="w-full flex justify-center">
//                   <button className="flex items-center gap-4 hover:bg-white/80 hover:text-black rounded-lg px-3 py-2">
//                     <PenLine />
//                     <span>Edit Profile</span>
//                   </button>
//                 </div>
//               </>
//             ) : (
//               <div className="w-full flex justify-center">
//                 <button className="flex items-center gap-4 hover:bg-white/80 hover:text-black rounded-lg px-3 py-2">
//                   <PenLine />
//                   <span>Edit Profile</span>
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="w-full p-2 lg:w-2/3 ">
//           <div className="rounded-lg bg-neutral-900 p-4">
//             {/* <Segmentation /> */}
//             <span className="text-2xl" style={{ fontFamily: "Cabin" }}>
//               Posts
//             </span>

//             <div className="my-4 h-[.01rem] w-full bg-white/50" />

//             <div>
//               <div className="flex flex-col gap-4 items-center w-full py-[10rem]">
//                 <span className="text-gray-500">
//                   Your Blog Posts and Interactions will appear here
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//         <div className="w-full p-2 lg:w-1/3 flex flex-col gap-4">
//           <span className="text-2xl" style={{ fontFamily: "Cabin" }}>
//             Subscriptions
//           </span>
//           <div className="w-full p-2 max-h-[35rem] overflow-y-auto no-scrollbar flex flex-col gap-3">
//             <div className="rounded-lg bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//             <div className="rounded-lg  bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//             <div className="rounded-lg  bg-neutral-900">
//               {/* <Satisfaction /> */}
//               <Subscription title={"Mobile Only v4"} percentage={28.0} />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const DesktopProfilePage: React.FC = () => {
//   const { loading } = useProfile();

//   if (loading) {
//     return <LoadingFallback />;
//   }

//   return (
//     <>
//       <Suspense fallback={<LoadingFallback />}>
//         <Content />
//       </Suspense>
//     </>
//   );
// };

// export default DesktopProfilePage;

