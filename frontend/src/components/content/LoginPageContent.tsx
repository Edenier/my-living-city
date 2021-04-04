import { useContext, useState } from 'react'
import { Col, Container, Row, Image, Form, Button, Alert, Card } from 'react-bootstrap'
import { useFormik } from 'formik'
import { LoginWithEmailAndPass } from '../../lib/types/input/loginWithEmailAndPass.input';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { FetchError } from '../../lib/types/types';
import { handlePotentialAxiosError, storeUserAndTokenInLocalStorage } from '../../lib/utilityFunctions';
import { useHistory } from 'react-router';
import { getUserWithEmailAndPass } from '../../lib/api/userRoutes';
import { ROUTES } from '../../lib/constants';

export default function LoginPageContent() {
  const {
    setToken,
    setUser,
  } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FetchError | null>(null);
  const [showError, setShowError] = useState(true);
  const history = useHistory();

  const submitHandler = async (values: LoginWithEmailAndPass) => {
    try {
      console.log("Submitted")
      // Set loading 
      setIsLoading(true);

      // Destructure payload and set global and local state
      const { token, user } = await getUserWithEmailAndPass(values);
      storeUserAndTokenInLocalStorage(token, user);
      setToken(token);
      setUser(user)

      // remove previous errors
      setError(null);
      formik.resetForm();
    } catch (error) {
      const genericMessage = "Error occured while logging in user.";
      const errorObj = handlePotentialAxiosError(genericMessage, error);
      setError(errorObj);
    } finally {
      setIsLoading(false);
    }
  }

  const formik = useFormik<LoginWithEmailAndPass>({
    initialValues: {
      email: '',
      password: '',
    },
    onSubmit: submitHandler
  })

  return (
    <main className='login-page-content'>
      <Card>
        <Card.Body className="my-5">
          <Image
            className="mb-4"
            src='/MyLivingCity_Logo_NameOnly.png'
            fluid
          />
          {error && (
            <Alert 
              show={showError} 
              onClose={() => setShowError(false)} 
              dismissible
              variant='danger' 
              className="error-alert" 
            >
              { error.message}
            </Alert>
          )}
          <Form onSubmit={formik.handleSubmit}>
            <Form.Group controlId="loginEmail" className="mt-2">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                name='email'
                type='email'
                required
                placeholder='Enter email'
                onChange={formik.handleChange}
                value={formik.values.email}
              />
              <Form.Text className='text-muted'>
                We'll never share your email with anyone else.
                </Form.Text>
            </Form.Group>
            <Form.Group controlId="loginPassword" className="mb-2">
              <Form.Label>Password</Form.Label>
              <Form.Control
                name='password'
                type='password'
                required
                placeholder='Password'
                onChange={formik.handleChange}
                value={formik.values.password}
              />
            </Form.Group>
            <Button
              block
              type='submit'
              disabled={isLoading ? true : false}
            >
              Login
            </Button>
          </Form>
          <div className="w-100 text-center mt-2">
            <a href={ROUTES.REGISTER}>Don't have an account? Create one.</a>
          </div>
        </Card.Body>
      </Card>
    </main >
  )
}