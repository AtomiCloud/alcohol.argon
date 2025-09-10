// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import Link from 'next/link';
// import { useState } from 'react';
// import { useAuth } from '@/lib/auth/providers';
// import { serverSideNoOp, withServerSideAtomi } from '@/adapters/atomi/next';
// import { buildTime } from '@/adapters/external/core';
//
// interface ClaimItemProps {
//   label: string;
//   value: unknown;
//   isExpandable?: boolean;
// }
//
// function ClaimItem({ label, value, isExpandable = false }: ClaimItemProps) {
//   const [isExpanded, setIsExpanded] = useState(false);
//
//   const formatValue = (val: unknown): string => {
//     if (val === null) return 'null';
//     if (val === undefined) return 'undefined';
//     if (typeof val === 'boolean') return val.toString();
//     if (typeof val === 'string') return val;
//     if (typeof val === 'number') return val.toString();
//     if (Array.isArray(val)) return JSON.stringify(val, null, 2);
//     if (typeof val === 'object') return JSON.stringify(val, null, 2);
//     return String(val);
//   };
//
//   const getValueType = (val: unknown): string => {
//     if (val === null) return 'null';
//     if (val === undefined) return 'undefined';
//     if (Array.isArray(val)) return 'array';
//     return typeof val;
//   };
//
//   const isComplexValue = (val: unknown): boolean => {
//     return typeof val === 'object' && val !== null && !Array.isArray(val);
//   };
//
//   const formattedValue = formatValue(value);
//   const valueType = getValueType(value);
//   const shouldTruncate = formattedValue.length > 100 && !isExpanded;
//
//   return (
//     <div className="py-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0">
//       <div className="flex items-start justify-between">
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center space-x-2 mb-1">
//             <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{label}</span>
//             <Badge variant="secondary" className="text-xs">
//               {valueType}
//             </Badge>
//           </div>
//
//           <div className="relative">
//             <pre
//               className={`text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap break-words font-mono ${
//                 shouldTruncate ? 'line-clamp-3' : ''
//               }`}
//             >
//               {shouldTruncate ? `${formattedValue.slice(0, 100)}...` : formattedValue}
//             </pre>
//
//             {(formattedValue.length > 100 || isComplexValue(value)) && (
//               <button
//                 onClick={() => setIsExpanded(!isExpanded)}
//                 className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
//               >
//                 {isExpanded ? 'Show less' : 'Show more'}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// export default function ProfilePage() {
//   const data = useAuth();
//
//   if (!data?.isAuthenticated) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="max-w-2xl mx-auto">
//           <Card>
//             <CardHeader className="text-center">
//               <CardTitle className="flex items-center justify-center space-x-2">
//                 <svg className="h-6 w-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                   />
//                 </svg>
//                 <span>Authentication Required</span>
//               </CardTitle>
//               <CardDescription>You need to be signed in to view your profile information.</CardDescription>
//             </CardHeader>
//             <CardContent className="text-center">
//               <Button asChild>
//                 <Link href="/api/logto/sign-in">Sign In</Link>
//               </Button>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     );
//   }
//
//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center space-x-4 mb-4">
//             <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
//               <span className="text-xl font-bold text-white">
//                 {data?.authData?.claims?.username?.charAt(0).toUpperCase() || 'U'}
//               </span>
//             </div>
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
//                 {data?.authData?.claims?.username || 'User Profile'}
//               </h1>
//               <p className="text-slate-600 dark:text-slate-400">
//                 {data?.authData?.claims?.email || 'Authenticated User'}
//               </p>
//             </div>
//           </div>
//
//           <div className="flex items-center space-x-3">
//             <Badge
//               variant="outline"
//               className="text-green-700 border-green-200 bg-green-50 dark:text-green-400 dark:border-green-800 dark:bg-green-950/20"
//             >
//               <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
//                 <path
//                   fillRule="evenodd"
//                   d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               Authenticated
//             </Badge>
//             <Badge variant="secondary">
//               Claims: {data?.authData?.claims ? Object.keys(data?.authData?.claims).length : 0}
//             </Badge>
//           </div>
//         </div>
//
//         {/* Claims Card */}
//         <Card>
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <svg
//                 className="h-5 w-5 text-slate-600 dark:text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
//                 />
//               </svg>
//               <span>User Claims</span>
//             </CardTitle>
//             <CardDescription>
//               All authentication claims and user information from your identity provider
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             {data?.authData?.claims && Object.keys(data?.authData?.claims).length > 0 ? (
//               <div className="space-y-0">
//                 {Object.entries(data?.authData?.claims).map(([key, value]) => (
//                   <ClaimItem key={key} label={key} value={value} isExpandable={typeof value === 'object'} />
//                 ))}
//               </div>
//             ) : (
//               <div className="text-center py-8">
//                 <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
//                   />
//                 </svg>
//                 <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No claims available</h3>
//                 <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                   No user claims were found in your authentication data.
//                 </p>
//               </div>
//             )}
//           </CardContent>
//         </Card>
//
//         {/* Token Set Card */}
//         <Card className="mt-6">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <svg
//                 className="h-5 w-5 text-slate-600 dark:text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//                 />
//               </svg>
//               <span>Access Tokens & ID Token</span>
//             </CardTitle>
//             <CardDescription>Authentication tokens for API access and identity verification</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-6">
//               {/* Access Tokens Section */}
//               {data.authData?.tokenSet && Object.keys(data.authData?.tokenSet.accessTokens).length > 0 && (
//                 <div>
//                   <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
//                     <svg
//                       className="h-4 w-4 mr-2 text-blue-600 dark:text-blue-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                       />
//                     </svg>
//                     Access Tokens
//                   </h3>
//                   <div className="space-y-0 border border-slate-200 dark:border-slate-700 rounded-lg">
//                     {Object.entries(data.authData?.tokenSet.accessTokens).map(([resource, token]) => (
//                       <div
//                         key={resource}
//                         className="p-3 border-b border-slate-100 dark:border-slate-800 last:border-b-0"
//                       >
//                         <div className="flex items-center space-x-2 mb-2">
//                           <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{resource}</span>
//                           <Badge variant="secondary" className="text-xs">
//                             Access Token
//                           </Badge>
//                         </div>
//                         <ClaimItem label="Token" value={token} isExpandable={true} />
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//
//               {/* ID Token Section */}
//               {data.authData?.tokenSet.idToken && (
//                 <div>
//                   <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-3 flex items-center">
//                     <svg
//                       className="h-4 w-4 mr-2 text-purple-600 dark:text-purple-400"
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                         strokeWidth={2}
//                         d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
//                       />
//                     </svg>
//                     ID Token
//                   </h3>
//                   <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-3">
//                     <div className="flex items-center space-x-2 mb-2">
//                       <span className="text-sm font-medium text-slate-900 dark:text-slate-100">Identity Token</span>
//                       <Badge variant="secondary" className="text-xs">
//                         ID Token
//                       </Badge>
//                     </div>
//                     <ClaimItem label="Token" value={data.authData?.tokenSet.idToken} isExpandable={true} />
//                   </div>
//                 </div>
//               )}
//             </div>
//             ) : (
//             <div className="text-center py-8">
//               <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
//                 />
//               </svg>
//               <h3 className="mt-2 text-sm font-medium text-slate-900 dark:text-slate-100">No tokens available</h3>
//               <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
//                 No authentication tokens were found. Please ensure you're logged in.
//               </p>
//             </div>
//             )
//           </CardContent>
//         </Card>
//
//         {/* Authentication Data Card */}
//         <Card className="mt-6">
//           <CardHeader>
//             <CardTitle className="flex items-center space-x-2">
//               <svg
//                 className="h-5 w-5 text-slate-600 dark:text-slate-400"
//                 fill="none"
//                 stroke="currentColor"
//                 viewBox="0 0 24 24"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                 />
//               </svg>
//               <span>Raw Authentication Data</span>
//             </CardTitle>
//             <CardDescription>Complete authentication context from Logto</CardDescription>
//           </CardHeader>
//           <CardContent>
//             <pre className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 overflow-auto max-h-96 font-mono">
//               {JSON.stringify(data, null, 2)}
//             </pre>
//           </CardContent>
//         </Card>
//
//         {/* Actions */}
//         <div className="mt-8 flex flex-col sm:flex-row gap-4">
//           <Button variant="outline" asChild>
//             <Link href="/">
//               <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//               </svg>
//               Back to Home
//             </Link>
//           </Button>
//           <Button
//             variant="outline"
//             className="text-red-700 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/20"
//             onClick={() => window.location.assign('/api/logto/sign-out')}
//           >
//             <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
//               />
//             </svg>
//             Sign Out
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }
//
// export const getServerSideProps = withServerSideAtomi(buildTime, serverSideNoOp);

export default function ProfilePage() {
  return (
    <div>
      <h1>Profile Page</h1>
    </div>
  );
}
