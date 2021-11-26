export const EXTENSION_ID = 'k9982874.github-gist-explorer';
export const EXTENSION_NAME = 'GitHub Gist Explorer';
export const GITHUB_API_URL =  'https://api.github.com';

export enum GistType {
  Public = 'Public',
  Secret = 'Secret'
}

export const CLASSIC_MOVIE_QUOTES = [
  {
    name: `Love Story, 1970`,
    words: `Love means never having to say you're sorry.`
  },
  {
    name: `Braveheart, 1995`,
    words: `They may take our lives, but they'll never take our freedom!`
  },
  {
    name: `In the Heat of the Night, 1967`,
    words: `They call me Mister Tibbs!`
  },
  {
    name: `When Harry Met Sally, 1989`,
    words: `When you realize you want to spend the rest of your life with somebody, you want the rest of your life to start as soon as possible.`
  },
  {
    name: `Taken, 2008`,
    words: `If you let my daughter go now, that'll be the end of it. I will not look for you, I will not pursue you. But if you don't, I will look for you, I will find you, and I will kill you.`
  },
  {
    name: `Jerry Maguire, 1996`,
    words: `You complete me.`
  },
  {
    name: `Gladiator, 2000`,
    words: `My name is Maximus Decimus Meridius, commander of the Armies of the North, General of the Felix Legions and loyal servant to the true emperor, Marcus Aurelius. Father to a murdered son, husband to a murdered wife. And I will have my vengeance, in this life or the next.`
  },
  {
    name: `There Will Be Blood, 2007`,
    words: `I drink your milkshake!`
  },
  {
    name: `Planet of the Apes, 1968`,
    words: `Get your stinking paws off me, you damned dirty ape!`
  },
  {
    name: `As Good as It Gets, 1997`,
    words: `You make me want to be a better man.`
  },
  {
    name: `Clueless, 1995`,
    words: `As if!`
  },
  {
    name: `Star Wars Episode VII: The Force Awakens, 2015`,
    words: `Chewie, we're home.`
  },
  {
    name: `Chinatown, 1974`,
    words: `Forget it, Jake. It's Chinatown.`
  },
  {
    name: `This Is Spinal Tap, 1984`,
    words: `These go to eleven.`
  },
  {
    name: `Midnight Cowboy, 1969`,
    words: `I'm walking here! I'm walking here!`
  },
  {
    name: `King Kong, 1933`,
    words: `It was Beauty killed the Beast.`
  },
  {
    name: `The Treasure of the Sierra Madre, 1948`,
    words: `Badges? We ain't got no badges! We don't need no badges! I don't have to show you any stinking badges!`
  },
  {
    name: `The Devil Wears Prada, 2006`,
    words: `I'm just one stomach flu away from my goal weight.`
  },
  {
    name: `Pulp Fiction, 1994`,
    words: `They call it a Royale with cheese.`
  },
  {
    name: `Poltergeist, 1982`,
    words: `They're here!`
  },
  {
    name: `Snow White and the Seven Dwarves, 1937`,
    words: `Magic Mirror on the wall, who is the fairest one of all?`
  },
  {
    name: `The Godfather: Part III, 1990`,
    words: `Just when I thought I was out, they pull me back in.`
  },
  {
    name: `Some Like It Hot, 1959`,
    words: `Nobody's perfect.`
  },
  {
    name: `Rocky, 1976`,
    words: `Yo, Adrian!`
  },
  {
    name: `The Karate Kid, 1984`,
    words: `Wax on, wax off.`
  },
  {
    name: `The Jazz Singer, 1927`,
    words: `You ain't heard nothin' yet!"`
  },
  {
    name: `Dr. Strangelove or: How I Learned to Stop Worrying and Love the Bomb, 1964`,
    words: `Gentlemen, you can't fight in here! This is the war room!`
  },
  {
    name: `12 Years a Slave, 2013`,
    words: `I don't want to survive. I want to live.`
  },
  {
    name: `The Adventures of Sherlock Holmes, 1939`,
    words: `Elementary, my dear Watson."`
  },
  {
    name: `Babe, 1995`,
    words: `That'll do, pig. That'll do.`
  },
  {
    name: `Brokeback Mountain, 2005`,
    words: `I wish I knew how to quit you.`
  },
  {
    name: `Good Morning, Vietnam, 1987`,
    words: `Good morning, Vietnam!`
  },
  {
    name: `The Lord of the Rings: The Two Towers, 2002`,
    words: `My precious.`
  },
  {
    name: `Argo, 2012`,
    words: `Argo f— yourself.`
  },
  {
    name: `Frankenstein, 1931`,
    words: `It's alive! It's alive!`
  },
  {
    name: `A Streetcar Named Desire, 1951`,
    words: `I have always depended on the kindness of strangers.`
  },
  {
    name: `Sudden Impact, 1983`,
    words: `Go ahead, make my day.`
  },
  {
    name: `Goodfellas, 1990`,
    words: `I mean, funny like I'm a clown? I amuse you?`
  },
  {
    name: `Star Wars, 1977`,
    words: `Help me, Obi-Wan Kenobi. You're my only hope.`
  },
  {
    name: `To Have and Have Not, 1944`,
    words: `You know how to whistle, don't you, Steve? You just put your lips together and blow.`
  },
  {
    name: `The Help, 2011`,
    words: `You is kind. You is smart. You is important.`
  },
  {
    name: `Gone With the Wind, 1939`,
    words: `After all, tomorrow is another day!`
  },
  {
    name: `A Streetcar Named Desire, 1951`,
    words: `Stella! Hey, Stella!"`
  },
  {
    name: `The Wizard of Oz, 1939`,
    words: `Pay no attention to that man behind the curtain!"`
  },
  {
    name: `Notting Hill, 1999`,
    words: `I'm also just a girl, standing in front of a boy, asking him to love her.`
  },
  {
    name: `The Big Lebowski, 1998`,
    words: `The Dude abides.`
  },
  {
    name: `Terminator 2: Judgment Day, 1991`,
    words: `Hasta la vista, baby.`
  },
  {
    name: `The Wizard of Oz, 1939`,
    words: `I'll get you, my pretty, and your little dog, too!`
  },
  {
    name: `Casablanca, 1942`,
    words: `Play it, Sam. Play 'As Time Goes By.'`
  },
  {
    name: `The Silence of the Lambs, 1991`,
    words: `I'm having an old friend for dinner.`
  },
  {
    name: `Who Framed Roger Rabbit, 1988`,
    words: `I'm not bad. I'm just drawn that way.`
  },
  {
    name: `Field of Dreams, 1989`,
    words: `If you build it, he will come.`
  },
  {
    name: `Finding Nemo, 2003`,
    words: `Just keep swimming.`
  },
  {
    name: `Forrest Gump, 1994`,
    words: `Mama says, 'Stupid is as stupid does.'`
  },
  {
    name: `Titanic, 1997`,
    words: `I'm the king of the world!`
  },
  {
    name: `Goldfinger, 1964`,
    words: `Shaken, not stirred.`
  },
  {
    name: `Cool Hand Luke, 1967`,
    words: `What we've got here is a failure to communicate.`
  },
  {
    name: `Sunset Boulevard, 1950`,
    words: `I am big! It's the pictures that got small.`
  },
  {
    name: `It's a Wonderful Life, 1946`,
    words: `Every time a bell rings, an angel gets his wings.`
  },
  {
    name: `The Godfather, Part II, 1974`,
    words: `Keep your friends close, but your enemies closer.`
  },
  {
    name: `The Usual Suspects, 1995`,
    words: `The greatest trick the devil ever pulled was convincing the world he didn't exist.`
  },
  {
    name: `Network, 1976`,
    words: `I'm as mad as hell, and I'm not going to take this anymore!`
  },
  {
    name: `On the Waterfront, 1954`,
    words: `You don't understand! I could've had class. I could've been a contender. I could've been somebody, instead of a bum, which is what I am.`
  },
  {
    name: `Back to the Future, 1985`,
    words: `Roads? Where we're going we don't need roads.`
  },
  {
    name: `All About Eve, 1950`,
    words: `Fasten your seatbelts. It's going to be a bumpy night.`
  },
  {
    name: `Apocalypse Now, 1979`,
    words: `I love the smell of napalm in the morning.`
  },
  {
    name: `Dirty Harry, 1971`,
    words: `You've got to ask yourself one question: 'Do I feel lucky?' Well, do ya punk?`
  },
  {
    name: `Scarface, 1983`,
    words: `Say hello to my little friend!`
  },
  {
    name: `Jerry Maguire, 1996`,
    words: `Show me the money!`
  },
  {
    name: `The Godfather, 1972`,
    words: `Leave the gun. Take the cannoli.`
  },
  {
    name: `Dead Poets Society, 1989`,
    words: `Carpe diem. Seize the day, boys.`
  },
  {
    name: `The Graduate, 1967`,
    words: `Mrs. Robinson, you're trying to seduce me, aren't you?`
  },
  {
    name: `Airplane, 1980`,
    words: `I am serious. And don't call me Shirley.`
  },
  {
    name: `The Shining, 1980`,
    words: `Here's Johnny!`
  },
  {
    name: `A League of Their Own, 1992`,
    words: `There's no crying in baseball!"`
  },
  {
    name: `Jerry Maguire, 1996`,
    words: `You had me at hello.`
  },
  {
    name: `Apollo 13, 1995`,
    words: `Houston, we have a problem.`
  },
  {
    name: `Toy Story, 1995`,
    words: `To infinity and beyond!"`
  },
  {
    name: `Die Hard, 1988`,
    words: `Yippie-ki-yay, motherf—er!`
  },
  {
    name: `E.T. the Extra-Terrestrial, 1982`,
    words: `E.T. phone home.`
  },
  {
    name: `A Few Good Men, 1992`,
    words: `You can't handle the truth!`
  },
  {
    name: `The Terminator, 1984`,
    words: `I'll be back.`
  },
  {
    name: `The Sixth Sense, 1999`,
    words: `I see dead people.`
  },
  {
    name: `Dr. No, 1962`,
    words: `Bond. James Bond.`
  },
  {
    name: `Casablanca, 1942`,
    words: `We'll always have Paris.`
  },
  {
    name: `Casablanca, 1942`,
    words: `This is the beginning of a beautiful friendship.`
  },
  {
    name: `When Harry Met Sally, 1989`,
    words: `I'll have what she's having."`
  },
  {
    name: `The Dark Knight, 2008`,
    words: `Why so serious?`
  },
  {
    name: `The Princess Bride, 1987`,
    words: `Hello. My name is Inigo Montoya. You killed my father. Prepare to die.`
  },
  {
    name: `Star Wars Episode V: The Empire Strikes Back, 1980`,
    words: `I am your father.`
  },
  {
    name: `Fight Club, 1999`,
    words: `The first rule of Fight Club is: You do not talk about Fight Club.`
  },
  {
    name: `The Wizard of Oz, 1939`,
    words: `There's no place like home.`
  },
  {
    name: `Taxi Driver, 1976`,
    words: `You talkin' to me?`
  },
  {
    name: `Casablanca, 1942`,
    words: `Of all the gin joints in all the towns in all the world, she walks into mine.`
  },
  {
    name: `The Godfather, 1972`,
    words: `I'm going to make him an offer he can't refuse.`
  },
  {
    name: `The Wizard of Oz, 1939`,
    words: `Toto, I've a feeling we're not in Kansas anymore.`
  },
  {
    name: `Star Wars, 1977`,
    words: `May the Force be with you.`
  },
  {
    name: `Jaws, 1975`,
    words: `You're gonna need a bigger boat.`
  },
  {
    name: `Casablanca, 1942`,
    words: `Here's looking at you, kid.`
  },
  {
    name: `Gone With the Wind, 1939`,
    words: `Frankly, my dear, I don't give a damn.`
  }
];
