import { useContext, useState } from 'react'
import { Col, Container, Row, Image, Form, Button, Alert } from 'react-bootstrap'
import { useFormik } from 'formik'
import { LoginWithEmailAndPass } from '../../lib/types/input/loginWithEmailAndPass.input';
import { UserProfileContext } from '../../contexts/UserProfile.Context';
import { FetchError } from '../../lib/types/types';
import { storeUserAndTokenInLocalStorage } from '../../lib/utilityFunctions';
import { useHistory } from 'react-router';
import { getUserWithEmailAndPass } from '../../lib/api/userRoutes';

export default function LoginPageContent() {
  const {
    setToken,
    setUser,
  } = useContext(UserProfileContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<FetchError | null>(null);
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
      let errorObj: FetchError = {
        message: "Error occured while logging in user."
      }
      if (error.response) {
        // Request made and server responded
        errorObj.message = error.response.data.message;
        errorObj.details = {
          errorMessage: error.response.data.message,
          errorStack: error.response.status
        }
        console.log(error.response.data);
        console.log(error.response.status);
        console.log(error.response.headers);
      } else if (error.request) {
        // The request was made but no response was received
        console.log(error.request);
        errorObj.message = "Error no response received";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
        errorObj.message = error.message
      }
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
      <Container>
        <Row>
          <Image
            src='/MyLivingCity_Logo_NameOnly.png'
            fluid
          />
        </Row>
        <Row
          className='login-form-group justify-content-center'
        >
          <Col md={8}>
            <Form onSubmit={formik.handleSubmit}>
              <Form.Group controlId="loginEmail">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  name='email'
                  type='email'
                  placeholder='Enter email'
                  onChange={formik.handleChange}
                  value={formik.values.email}
                />
                <Form.Text className='text-muted'>
                  We'll never share your email with anyone else.
                </Form.Text>
              </Form.Group>
              <Form.Group controlId="loginPassword">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  name='password'
                  type='password'
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
              <Button
                block
                type='button'
                disabled={isLoading ? true : false}
                onClick={() => history.push('/register')}
              >
                Register
              </Button>
              {error && (
                <Alert variant='danger' className="error-alert">
                  { error.message}
                </Alert>
              )}
            </Form>
          </Col>
        </Row>
      </Container>
    </main>
  )
}
