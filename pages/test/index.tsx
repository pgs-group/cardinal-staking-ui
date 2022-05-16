import DefaultLayout from 'components/Layouts/Default'
export default function test() {
  return <div>test</div>
}
test.getLayout = function getLayout(page) {
  return <DefaultLayout>{page}</DefaultLayout>
}
