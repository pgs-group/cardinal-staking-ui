import Head from 'next/head'
import StakingBox from 'components/StakingBox'

export default function testPage() {
  return (
    <>
      <Head>
        <link
          href="https://fonts.googleapis.com/css2?family=Lilita+One&display=swap"
          rel="stylesheet"
        />
      </Head>
      <div className="align-center flex justify-center p-10">
        <StakingBox />
      </div>
    </>
  )
}
