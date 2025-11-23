'use strict';

const reader = ({ id }) => ({ id, name: 'marcus', age: 42 });

const execute = (plan) => (reader, log, env = {}) => {
  if (plan.read) {
    const user = reader(plan.read);
    return execute(plan.then)(reader, log, { user });
  }
  if (plan.match) {
    const ok = env.user.name === plan.match.name;
    return execute(ok ? plan.success : plan.fail)(reader, log, env);
  }
  if (plan.effect) {
    if (plan.effect.log) return () => log(env.user[plan.effect.log]);
    if (plan.effect === 'noop') return () => {};
  }
};

execute({
  read: { id: 15 },
  then: {
    match: { name: 'marcus' },
    success: { effect: { log: 'age' } },
    fail: { effect: 'noop' },
  },
})(reader, console.log)();

// 1. Rewrite in OOP style
// 2. Improve data structure inconsistence

// const main = new Exec(options);
// main.run(steps);
