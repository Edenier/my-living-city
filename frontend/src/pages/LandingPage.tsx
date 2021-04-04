import React from 'react'
import LandingPageContent from '../components/content/LandingPageContent'
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useIdeas, useIdeasWithAggregate } from '../hooks/ideaHooks'

export default function LandingPage() {

  const { data, isLoading, error, isError } = useIdeasWithAggregate({
    orderBy: {
      updatedAt: 'desc'
    },
    take: 3,
  });


  if (isLoading) {
    <div className="wrapper">
      <LoadingSpinner />
    </div>
  }

  return (
    <div className="wrapper">
      <LandingPageContent topIdeas={data} />
    </div>
  )
}