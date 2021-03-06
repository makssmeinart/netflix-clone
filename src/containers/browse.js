import { SelectProfileContainer } from "./profiles"
import { FirebaseContext } from "../context/firebase"
import { useContext, useEffect, useState } from "react"
import { Header, Loading, Card, Player } from "../components"
import { FooterContainer } from "../containers/footer"
import Fuse from "fuse.js"
import * as ROUTES from "../constants/routes"

export function BrowseContainer({ slides }) {
  // The switch between series and films
  const [category, setCategory] = useState("films")
  const [searchTerm, setSearchTerm] = useState("")
  // Here we find thje
  const [profile, setProfile] = useState({})
  // This is to get rid of the loading after its finished
  const [loading, setLoading] = useState(true)
  const [slideRows, setSlideRows] = useState([])

  const { firebase } = useContext(FirebaseContext)
  const user = firebase.auth().currentUser || {}

  // After the profile has been picked we want to remove the loading after 3 seconds
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }, [profile.displayName])


  useEffect(() => {
    setSlideRows(slides[category])
  }, [slides, category])

  useEffect(() => {
    const fuse = new Fuse(slideRows, {
      keys: ["data.description", "data.title", "data.genre"],
    })
    const result = fuse.search(searchTerm).map(({ item }) => item)

    if(slideRows.length > 0 && searchTerm.length > 3 && result.length > 0) {
      setSlideRows(result)
    }
    else {
      setSlideRows(slides[category])
    }
  }, [searchTerm])

  return profile.displayName ? (
    <>
      {loading ? <Loading src={user.photoURL} /> : <Loading.ReleaseBody />}

      <Header src="joker1" backgroundRemoveOnSmallVP>
        <Header.Inner>
          <Header.Group>
            <Header.Logo
              src={"images/icons/logo.svg"}
              alt="Nerflix"
              to={ROUTES.HOME}
            />
            <Header.TextLink
              active={category === "films" ? true : false}
              onClick={() => setCategory("films")}
            >
              Films
            </Header.TextLink>
            <Header.TextLink
              active={category === "series" ? true : false}
              onClick={() => setCategory("series")}
            >
              Series
            </Header.TextLink>
          </Header.Group>
          <Header.Group>
            <Header.Group>
              <Header.Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
              >
                Header Search
              </Header.Search>
            </Header.Group>
            <Header.Profile>
              <Header.Picture src={user.photoURL} />
              <Header.Dropdown>
                <Header.Group>
                  <Header.Picture src={user.photoURL} />
                  <Header.TextLink>{user.displayName}</Header.TextLink>
                </Header.Group>
                <Header.Group>
                  <Header.TextLink onClick={() => firebase.auth().signOut()}>
                    Sign Out
                  </Header.TextLink>
                </Header.Group>
              </Header.Dropdown>
            </Header.Profile>
          </Header.Group>
        </Header.Inner>

        <Header.Feature>
          <Header.FeatureCallOut>Watch Joker Now</Header.FeatureCallOut>
          <Header.Text>
            Forever alone in a crowd, failed comedian Arthur Fleck seeks
            connection as he walks the streets of Gotham City. Arthur wears two
            masks -- the one he paints for his day job as a clown, and the guise
            he projects in a futile attemp to feel like he's part of the world
            around him.
          </Header.Text>
          <Header.PlayButton>Play</Header.PlayButton>
        </Header.Feature>
      </Header>

      <Card.Group>
        {slideRows.map((slideItem) => (
          <Card key={`${category}-${slideItem.title.toLowerCase()}`}>
            <Card.Title>{slideItem.title}</Card.Title>
            <Card.Entities>
              {slideItem.data.map((currentSlide) => (
                <Card.Item key={currentSlide.docId} item={currentSlide}>
                  <Card.Image
                    src={`images/${category}/${currentSlide.genre}/${currentSlide.slug}/small.jpg`}
                  />

                  <Card.Meta>
                    <Card.SubTitle>{currentSlide.title}</Card.SubTitle>
                    <Card.Text>{currentSlide.description}</Card.Text>
                  </Card.Meta>
                </Card.Item>
              ))}
            </Card.Entities>
            {/* The dropdown */}
            <Card.Feature category={category}>
              <Player>
                <Player.Button />
                <Player.Video src={`videos/bunny.mp4`} />
              </Player>
            </Card.Feature>
          </Card>
        ))}
      </Card.Group>

      <FooterContainer />
    </>
  ) : (
    <SelectProfileContainer user={user} setProfile={setProfile} />
  )
}
