import { Switch, Route } from "wouter";
import Chat from "@/components/Chat";

function App() {
  return (
    <Switch>
      <Route path="/" component={Chat} />
    </Switch>
  );
}

export default App;
