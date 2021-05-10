import React from 'react'
import { Container, Row, Spinner } from 'react-bootstrap';
import { IdeaBreakdown } from '../../lib/types/data/idea.type';
import { FetchError } from '../../lib/types/types';
import CategoriesSection from '../partials/LandingContent/CategoriesSection';
import DescriptionSection from '../partials/LandingContent/DescriptionSection';
import HeroBannerSection from '../partials/LandingContent/HeroBannerSection';
import NewAndTrendingSection from '../partials/LandingContent/NewAndTrendingSection';

interface LandingPageContentProps {
  topIdeas: IdeaBreakdown[] | undefined;
  ideasLoading: boolean,
  ideasIsError: boolean,
  ideasError: FetchError | null,
}

const LandingPageContent: React.FC<LandingPageContentProps> = ({
  topIdeas,
  ideasLoading,
  ideasIsError,
  ideasError,
}) => {
  return (
    <Container className='landing-page-content'>
      <HeroBannerSection />
      <Row as='article' className='featured'>
      </Row>
      {ideasLoading && (
        <div className="landing-spinner d-flex justify-content-center my-4">
          <Spinner animation='border' />
        </div>
      )}
      {topIdeas && !ideasIsError && !ideasLoading && (
        <Row as='article' className='new-and-trending'>
          <NewAndTrendingSection topIdeas={topIdeas!} />
        </Row>
      )}
      <Row as='article' className='categories'>
        <CategoriesSection />
      </Row>
      <Row as='article' className='description'>
        <DescriptionSection />
      </Row>
    </Container>
  )
}

export default LandingPageContent