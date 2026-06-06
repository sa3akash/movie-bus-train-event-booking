'use client'

import React from 'react'

const OfflinePage = () => {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
            <div className="max-w-md rounded-lg border border-card bg-card shadow-sm">
                <div className="p-6 text-center">
                    <svg className="mx-auto h-12 w-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 0112.728 0M5 12a7 7 0 0114 0M5 3a9 9 0 0112.728 0M21 12a9 9 0 01-9 9" />
                    </svg>
                    <h2 className="mt-4 text-xl font-semibold text-foreground">You are offline</h2>
                    <p className="mt-2 text-muted-foreground">Please check your internet connection and try again.</p>
                    <div className='flex flex-col justify-center mt-6 gap-2'>
                        <a 
                            href="" 
                            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground"
                        >
                            Refresh
                        </a>
                        <a
                            href="/downloads"
                            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
                        >
                            Go back to Downloads
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OfflinePage