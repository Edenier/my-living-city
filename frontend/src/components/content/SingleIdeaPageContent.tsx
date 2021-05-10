import React, { useContext } from 'react'
import { Col, Container, Row } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import UserProfileContext from 'src/contexts/UserProfile.Context';
import { useAllCommentsUnderIdea } from 'src/hooks/commentHooks';
import { IIdea, IIdeaWithBasicUser } from '../../lib/types/data/idea.type';
import { capitalizeString } from '../../lib/utilityFunctions';
import CommentsSection from '../partials/SingleIdeaContent/CommentsSection';
import RatingsSection from '../partials/SingleIdeaContent/RatingsSection';

interface SingleIdeaPageContentProps {
  ideaData: IIdeaWithBasicUser
}

const SingleIdeaPageContent: React.FC<SingleIdeaPageContentProps> = ({ ideaData }) => {
  const {
    title,
    description,
    communityImpact,
    natureImpact,
    artsImpact,
    energyImpact,
    manufacturingImpact,
    createdAt,
    category,
    author,
  } = ideaData;

  const { title: catTitle } = category!;
  const parsedDate = new Date(createdAt);

  return (
    <Container className='single-idea-content'>
      <Row>
        <Col>
          <h1 className='h1'>{capitalizeString(title)}</h1>
          <h4 className='h5'>Category: {capitalizeString(catTitle)}</h4>
          <h4 className="h5">Posted by: {author?.fname}@{author?.address?.streetAddress}</h4>
          <h5 className='h5'>Created: {parsedDate.toLocaleDateString()}</h5>
          <br />
          <p>{description}</p>
          <p><strong>Community and place:</strong> {communityImpact}</p>
          <p><strong>Nature and Food Security:</strong> {natureImpact}</p>
          <p><strong>Arts, Culture, and Education:</strong> {artsImpact}</p>
          <p><strong>Water and Energy:</strong> {energyImpact}</p>
          <p><strong>Manufacturing and Waste:</strong> {manufacturingImpact ? capitalizeString(manufacturingImpact) : ""}</p>
        </Col>
      </Row>
      <Row>
        <RatingsSection />
      </Row>
      <Row>
        <CommentsSection />
      </Row>
    </Container>
  );
}

export default SingleIdeaPageContent